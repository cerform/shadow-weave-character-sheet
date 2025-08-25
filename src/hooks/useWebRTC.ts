import { useRef, useState, useCallback, useEffect } from 'react';

interface UseWebRTCProps {
  sessionId: string;
  playerName: string;
  isDM?: boolean;
}

interface Participant {
  id: string;
  name: string;
  isDM: boolean;
  peerConnection?: RTCPeerConnection;
}

export const useWebRTC = ({ sessionId, playerName, isDM = false }: UseWebRTCProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const socketRef = useRef<WebSocket | null>(null);

  // WebRTC configuration
  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Инициализация локального медиа потока
  const initializeLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // По умолчанию отключаем треки
      stream.getVideoTracks().forEach(track => track.enabled = false);
      stream.getAudioTracks().forEach(track => track.enabled = false);
      
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Ошибка доступа к медиа устройствам:', error);
      setConnectionError('Не удалось получить доступ к камере или микрофону');
      throw error;
    }
  }, []);

  // Создание peer connection
  const createPeerConnection = useCallback((participantId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(rtcConfig);
    
    // Обработка ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          targetId: participantId,
          candidate: event.candidate
        }));
      }
    };

    // Обработка входящих потоков
    pc.ontrack = (event) => {
      console.log('Получен удаленный поток от:', participantId);
      setParticipants(prev => {
        const updated = new Map(prev);
        const participant = updated.get(participantId);
        if (participant) {
          // Здесь можно обновить поток участника
          updated.set(participantId, { ...participant });
        }
        return updated;
      });
    };

    // Обработка изменения состояния соединения
    pc.onconnectionstatechange = () => {
      console.log(`Состояние соединения с ${participantId}:`, pc.connectionState);
      if (pc.connectionState === 'failed') {
        console.error(`Соединение с ${participantId} потеряно`);
      }
    };

    peerConnections.current.set(participantId, pc);
    return pc;
  }, []);

  // Подключение к WebSocket серверу
  const connectToSession = useCallback(async () => {
    try {
      setConnectionError(null);
      
      // Инициализируем локальный поток
      const stream = await initializeLocalStream();
      
      // Подключаемся к WebSocket серверу для сигнализации
      const wsUrl = `ws://localhost:3001/video-chat/${sessionId}`;
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log('Подключен к серверу видеочата');
        setIsConnected(true);
        
        // Сообщаем серверу о присоединении
        socket.send(JSON.stringify({
          type: 'join-room',
          sessionId,
          playerName,
          isDM
        }));
      };

      socket.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'participant-joined':
            console.log('Участник присоединился:', message.participant);
            setParticipants(prev => {
              const updated = new Map(prev);
              updated.set(message.participant.id, message.participant);
              return updated;
            });
            
            // Создаем offer для нового участника
            if (stream) {
              const pc = createPeerConnection(message.participant.id);
              stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
              });
              
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              
              socket.send(JSON.stringify({
                type: 'offer',
                targetId: message.participant.id,
                offer: offer
              }));
            }
            break;

          case 'participant-left':
            console.log('Участник покинул чат:', message.participantId);
            setParticipants(prev => {
              const updated = new Map(prev);
              updated.delete(message.participantId);
              return updated;
            });
            
            const pc = peerConnections.current.get(message.participantId);
            if (pc) {
              pc.close();
              peerConnections.current.delete(message.participantId);
            }
            break;

          case 'offer':
            console.log('Получен offer от:', message.senderId);
            const offerPc = createPeerConnection(message.senderId);
            
            if (stream) {
              stream.getTracks().forEach(track => {
                offerPc.addTrack(track, stream);
              });
            }
            
            await offerPc.setRemoteDescription(message.offer);
            const answer = await offerPc.createAnswer();
            await offerPc.setLocalDescription(answer);
            
            socket.send(JSON.stringify({
              type: 'answer',
              targetId: message.senderId,
              answer: answer
            }));
            break;

          case 'answer':
            console.log('Получен answer от:', message.senderId);
            const answerPc = peerConnections.current.get(message.senderId);
            if (answerPc) {
              await answerPc.setRemoteDescription(message.answer);
            }
            break;

          case 'ice-candidate':
            console.log('Получен ICE candidate от:', message.senderId);
            const candidatePc = peerConnections.current.get(message.senderId);
            if (candidatePc) {
              await candidatePc.addIceCandidate(message.candidate);
            }
            break;
        }
      };

      socket.onerror = (error) => {
        console.error('Ошибка WebSocket:', error);
        setConnectionError('Ошибка подключения к серверу');
      };

      socket.onclose = () => {
        console.log('Соединение с сервером закрыто');
        setIsConnected(false);
      };

      socketRef.current = socket;
      
    } catch (error) {
      console.error('Ошибка подключения:', error);
      setConnectionError('Не удалось подключиться к видеочату');
    }
  }, [sessionId, playerName, isDM, initializeLocalStream, createPeerConnection]);

  // Отключение от сессии
  const disconnectFromSession = useCallback(() => {
    // Закрываем все peer connections
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    
    // Останавливаем локальный поток
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Закрываем WebSocket
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setParticipants(new Map());
    setConnectionError(null);
  }, [localStream]);

  // Переключение видео
  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
  }, [localStream]);

  // Переключение аудио
  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
  }, [localStream]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      disconnectFromSession();
    };
  }, [disconnectFromSession]);

  return {
    localStream,
    participants: Array.from(participants.values()),
    isConnected,
    connectionError,
    connectToSession,
    disconnectFromSession,
    toggleVideo,
    toggleAudio,
    isVideoEnabled: localStream?.getVideoTracks()?.[0]?.enabled ?? false,
    isAudioEnabled: localStream?.getAudioTracks()?.[0]?.enabled ?? false
  };
};