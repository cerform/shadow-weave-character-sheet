declare global {
  interface Window {
    google: any;
  }
}

interface GoogleAuthConfig {
  clientId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function initGoogleAuth({ clientId, onSuccess, onError }: GoogleAuthConfig) {
  if (!window.google?.accounts?.oauth2) {
    console.error('Google Identity Services не загружен');
    onError?.('Google Identity Services не загружен');
    return null;
  }

  const codeClient = window.google.accounts.oauth2.initCodeClient({
    client_id: clientId,
    scope: 'openid email profile',
    ux_mode: 'popup',
    callback: async (response: { code: string; error?: string }) => {
      if (response.error) {
        console.error('Google auth error:', response.error);
        onError?.(response.error);
        return;
      }

      try {
        console.log('🔄 Получили код от Google, отправляем на сервер');
        
        // Отправляем code на edge function для обмена на токены
        const result = await fetch('/api/auth/google/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: response.code }),
        });

        const data = await result.json();
        
        if (!result.ok) {
          throw new Error(data.error || 'Ошибка авторизации');
        }

        console.log('✅ Успешная авторизация через Google');
        onSuccess?.();
        
      } catch (error) {
        console.error('❌ Ошибка обмена кода:', error);
        onError?.(error instanceof Error ? error.message : 'Произошла ошибка');
      }
    },
  });

  return codeClient;
}

export function startGoogleAuth(codeClient: any) {
  if (codeClient) {
    codeClient.requestCode();
  }
}