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

let codeClient: any | null = null;

export function initGoogleAuth({ clientId, onSuccess, onError }: GoogleAuthConfig) {
  if (!window.google?.accounts?.oauth2) {
    console.error('Google Identity Services не загружен');
    onError?.('Google Identity Services не загружен');
    return null;
  }

  codeClient = window.google.accounts.oauth2.initCodeClient({
    client_id: clientId,
    scope: 'openid email profile',
    ux_mode: 'redirect',
    redirect_uri: `${window.location.origin}/auth?callback=true`,
    callback: async (response: { code?: string; error?: string }) => {
      if (response.error) {
        console.error('Google auth error:', response.error);
        onError?.(response.error);
        return;
      }

      if (!response.code) {
        onError?.('Не получен код авторизации');
        return;
      }

      try {
        if (import.meta.env.DEV) {
          console.log('🔄 Получили код от Google, отправляем на сервер');
        }
        
        const result = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-google-callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: response.code }),
        });

        const data = await result.json();
        
        if (!result.ok) {
          throw new Error(data.error || 'Ошибка авторизации');
        }

        if (import.meta.env.DEV) {
          console.log('✅ Успешная авторизация через Google');
        }
        onSuccess?.();
        
      } catch (error) {
        console.error('❌ Ошибка обмена кода:', error);
        onError?.(error instanceof Error ? error.message : 'Произошла ошибка');
      }
    },
  });

  return codeClient;
}

export function requestGoogleCode() {
  if (!codeClient) {
    throw new Error('Google codeClient не инициализирован');
  }
  codeClient.requestCode();
}