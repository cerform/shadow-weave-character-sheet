import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
  isDM: boolean;
}

interface WebRTCSignal {
  from: string;
  to: string;
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any;
}

export const useWebRTCChat = (sessionId: string, userId: string, userName: string, isDM: boolean) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());

  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  // Инициализация локального потока
  const initializeLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // По умолчанию отключаем
      stream.getVideoTracks().forEach(track => track.enabled = false);
      stream.getAudioTracks().forEach(track => track.enabled = false);
      
      setLocalStream(stream);
      console.log('✅ Local stream initialized');
      return stream;
    } catch (error) {
      console.error('❌ Error accessing media devices:', error);
      throw error;
    }
  };

  // Создание peer connection
  const createPeerConnection = (participantId: string, participantName: string, participantIsDM: boolean) => {
    console.log(`🔗 Creating peer connection to ${participantName}`);
    
    const pc = new RTCPeerConnection(rtcConfig);

    // Добавляем локальные треки
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Обрабатываем входящие треки
    pc.ontrack = (event) => {
      console.log(`📹 Received remote track from ${participantName}`);
      const remoteStream = event.streams[0];
      remoteStreamsRef.current.set(participantId, remoteStream);
      
      setParticipants(prev => {
        const exists = prev.find(p => p.id === participantId);
        if (exists) {
          return prev.map(p => 
            p.id === participantId 
              ? { ...p, stream: remoteStream }
              : p
          );
        }
        return [...prev, { 
          id: participantId, 
          name: participantName, 
          isDM: participantIsDM,
          stream: remoteStream 
        }];
      });
    };

    // Обрабатываем ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        console.log(`🧊 Sending ICE candidate to ${participantName}`);
        channelRef.current.send({
          type: 'broadcast',
          event: 'webrtc-signal',
          payload: {
            from: userId,
            to: participantId,
            type: 'ice-candidate',
            data: event.candidate
          }
        });
      }
    };

    // Отслеживаем состояние подключения
    pc.onconnectionstatechange = () => {
      console.log(`🔌 Connection state with ${participantName}: ${pc.connectionState}`);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        peerConnectionsRef.current.delete(participantId);
        remoteStreamsRef.current.delete(participantId);
        setParticipants(prev => prev.filter(p => p.id !== participantId));
      }
    };

    peerConnectionsRef.current.set(participantId, pc);
    return pc;
  };

  // Создание offer
  const createOffer = async (participantId: string, participantName: string, participantIsDM: boolean) => {
    console.log(`📤 Creating offer for ${participantName}`);
    
    const pc = createPeerConnection(participantId, participantName, participantIsDM);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'webrtc-signal',
        payload: {
          from: userId,
          to: participantId,
          type: 'offer',
          data: offer
        }
      });
    }
  };

  // Обработка offer
  const handleOffer = async (signal: WebRTCSignal, fromName: string, fromIsDM: boolean) => {
    console.log(`📥 Received offer from ${fromName}`);
    
    const pc = createPeerConnection(signal.from, fromName, fromIsDM);
    await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
    
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'webrtc-signal',
        payload: {
          from: userId,
          to: signal.from,
          type: 'answer',
          data: answer
        }
      });
    }
  };

  // Обработка answer
  const handleAnswer = async (signal: WebRTCSignal) => {
    console.log(`📨 Received answer from ${signal.from}`);
    
    const pc = peerConnectionsRef.current.get(signal.from);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
    }
  };

  // Обработка ICE candidate
  const handleIceCandidate = async (signal: WebRTCSignal) => {
    console.log(`🧊 Received ICE candidate from ${signal.from}`);
    
    const pc = peerConnectionsRef.current.get(signal.from);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(signal.data));
    }
  };

  // Подключение к сессии
  const connect = async () => {
    try {
      console.log(`🚀 Connecting to session ${sessionId}`);
      
      const stream = await initializeLocalStream();
      
      // Создаем канал Realtime
      const channel = supabase.channel(`webrtc:${sessionId}`, {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      // Обрабатываем присутствие
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('👥 Presence state:', state);
        
        // Создаем offers для новых участников
        Object.keys(state).forEach((key) => {
          const presenceData = state[key][0] as any;
          if (presenceData.user_id !== userId) {
            // Создаем offer только если нет существующего подключения
            if (!peerConnectionsRef.current.has(presenceData.user_id)) {
              createOffer(
                presenceData.user_id, 
                presenceData.user_name,
                presenceData.is_dm
              );
            }
          }
        });
      });

      // Обрабатываем WebRTC сигналы
      channel.on('broadcast', { event: 'webrtc-signal' }, async ({ payload }: { payload: WebRTCSignal }) => {
        if (payload.to !== userId) return;

        console.log('📡 Received WebRTC signal:', payload.type);

        try {
          if (payload.type === 'offer') {
            const state = channel.presenceState();
            const fromPresence = Object.values(state).flat().find((p: any) => p.user_id === payload.from) as any;
            if (fromPresence) {
              await handleOffer(payload, fromPresence.user_name, fromPresence.is_dm);
            }
          } else if (payload.type === 'answer') {
            await handleAnswer(payload);
          } else if (payload.type === 'ice-candidate') {
            await handleIceCandidate(payload);
          }
        } catch (error) {
          console.error('❌ Error handling signal:', error);
        }
      });

      // Подписываемся на канал
      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to channel');
          
          // Отправляем свое присутствие
          await channel.track({
            user_id: userId,
            user_name: userName,
            is_dm: isDM,
            online_at: new Date().toISOString(),
          });

          setIsConnected(true);
        }
      });

      channelRef.current = channel;
    } catch (error) {
      console.error('❌ Error connecting:', error);
      throw error;
    }
  };

  // Отключение
  const disconnect = () => {
    console.log('🔌 Disconnecting from session');
    
    // Закрываем все peer connections
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    remoteStreamsRef.current.clear();

    // Останавливаем локальный поток
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Отписываемся от канала
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    setParticipants([]);
    setIsConnected(false);
    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
  };

  // Переключение видео
  const toggleVideo = () => {
    if (localStream) {
      const enabled = !isVideoEnabled;
      localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      setIsVideoEnabled(enabled);
    }
  };

  // Переключение аудио
  const toggleAudio = () => {
    if (localStream) {
      const enabled = !isAudioEnabled;
      localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      setIsAudioEnabled(enabled);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    localStream,
    participants,
    isVideoEnabled,
    isAudioEnabled,
    isConnected,
    connect,
    disconnect,
    toggleVideo,
    toggleAudio,
  };
};
