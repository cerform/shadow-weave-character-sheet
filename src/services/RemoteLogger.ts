/**
 * RemoteLogger — sends important events to Vercel Function Logs via /api/log
 * In development, just uses console. In production, ships to Vercel.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogPayload {
  level?: LogLevel;
  event: string;
  message?: string;
  data?: Record<string, unknown>;
}

const isDev = import.meta.env.DEV;

async function sendToVercel(payload: LogPayload): Promise<void> {
  if (isDev) return; // Don't send in dev — use local console
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
      // fire-and-forget — don't block the app
      keepalive: true,
    });
  } catch {
    // Silently swallow — logging must never break the app
  }
}

export const RemoteLogger = {
  info(event: string, message?: string, data?: Record<string, unknown>) {
    const level: LogLevel = 'info';
    console.log(`[${event}]`, message ?? '', data ?? '');
    sendToVercel({ level, event, message, data });
  },

  warn(event: string, message?: string, data?: Record<string, unknown>) {
    const level: LogLevel = 'warn';
    console.warn(`[${event}]`, message ?? '', data ?? '');
    sendToVercel({ level, event, message, data });
  },

  error(event: string, message?: string, data?: Record<string, unknown>) {
    const level: LogLevel = 'error';
    console.error(`[${event}]`, message ?? '', data ?? '');
    sendToVercel({ level, event, message, data });
  },
};
