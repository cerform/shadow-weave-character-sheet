import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RemoteLogger } from '@/services/RemoteLogger';
import { SentryService } from '@/services/SentryService';

// Проверка переменных окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing!');
}

import App from './App';

import './index.css';

// Initial logs
RemoteLogger.info('APP_START', 'Shadow Weave application starting...');
SentryService.init();

import ReactDOM from 'react-dom/client';
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
