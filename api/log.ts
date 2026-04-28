import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set typical CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { level = 'info', event, message, data, url, userAgent, timestamp } = req.body || {};

    const logEntry = {
      ts: timestamp || new Date().toISOString(),
      level,
      event,
      message,
      data,
      url,
      ua: userAgent,
    };

    // Vercel captures console output in Function Logs
    if (level === 'error') {
      console.error('[AUTH-LOG]', JSON.stringify(logEntry));
    } else if (level === 'warn') {
      console.warn('[AUTH-LOG]', JSON.stringify(logEntry));
    } else {
      console.log('[AUTH-LOG]', JSON.stringify(logEntry));
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[AUTH-LOG] Failed to parse log entry:', err);
    return res.status(400).json({ error: 'Bad request' });
  }
}
