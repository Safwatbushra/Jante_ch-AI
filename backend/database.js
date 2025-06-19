import { supabase } from './supabase.js'

// Chat session functions
export async function createChatSession(title = 'New Chat') {
  const { data, error } = await supabase.rpc('create_chat_session', {
    session_title: title
  })
  return { data, error }
}

export async function getUserChatSessions() {
  const { data, error } = await supabase.rpc('get_user_chat_sessions')
  return { data, error }
}

export async function getChatMessages(sessionId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  
  return { data, error }
}

// Message functions
export async function saveMessage(sessionId, role, content) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      session_id: sessionId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      role: role,
      content: content
    })
    .select()
  
  return { data, error }
}

export async function updateChatTitle(sessionId, title) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .update({ title: title, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
  
  return { data, error }
}

// User profile functions
export async function createUserProfile(userId, email) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, email: email })
    .select()
  
  return { data, error }
}