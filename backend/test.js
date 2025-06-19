// test.js
import { supabase } from './supabase.js'
import { createChatSession, saveMessage, getChatMessages } from './database.js'

async function testDatabase() {
  // Test authentication
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'testpassword'
  })
  
  if (authError) {
    console.log('Auth error:', authError)
    return
  }
  
  // Test creating session
  const { data: sessionId, error: sessionError } = await createChatSession('Test Chat')
  console.log('Created session:', sessionId)
  
  // Test saving messages
  await saveMessage(sessionId, 'user', 'Hello!')
  await saveMessage(sessionId, 'assistant', 'Hi there! How can I help?')
  
  // Test retrieving messages
  const { data: messages } = await getChatMessages(sessionId)
  console.log('Messages:', messages)
}

testDatabase()