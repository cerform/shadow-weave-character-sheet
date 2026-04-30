
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSession(sessionId) {
  console.log(`Checking session: ${sessionId}`);
  
  const { data: session, error: sError } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
    
  if (sError) {
    console.error('Error fetching session:', sError);
    return;
  }
  
  console.log('Session data:', JSON.stringify(session, null, 2));
  
  const { data: messages, error: mError } = await supabase
    .from('session_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
    
  if (mError) {
    console.error('Error fetching messages:', mError);
  } else {
    console.log(`Messages found: ${messages.length}`);
    messages.forEach(m => {
      console.log(`[${m.created_at}] ${m.sender_name}: ${m.content.substring(0, 50)}...`);
    });
  }
  
  const { data: context, error: cError } = await supabase
    .from('campaign_context')
    .select('*')
    .eq('session_id', sessionId)
    .single();
    
  if (cError) {
    console.error('Error fetching context:', cError);
  } else {
    console.log('Campaign Context found:', JSON.stringify(context, null, 2));
  }
}

const sessionId = process.argv[2];
if (sessionId) {
  checkSession(sessionId);
} else {
  console.log('Please provide a session ID');
}
