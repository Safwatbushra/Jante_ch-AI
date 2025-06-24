import { mongodb, ObjectId } from './mongodb.js';

// Chat session functions
export async function createChatSession(title = 'New Chat', userId) {
  try {
    console.log('[DEBUG] Creating chat session for user:', userId);
    const db = mongodb.getDb();
    console.log('[DEBUG] Database connection successful');
    
    const newSession = {
      title,
      userId: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('chat_sessions').insertOne(newSession);
    console.log('[DEBUG] Chat session created with ID:', result.insertedId);
    
    return { 
      data: result.insertedId, 
      error: null 
    };
  } catch (error) {
    console.error('[ERROR] Failed to create chat session:', error);
    return { 
      data: null, 
      error: { message: error.message }
    };
  }
}

export async function getUserChatSessions(userId) {
  try {
    const db = mongodb.getDb();
    
    const sessions = await db.collection('chat_sessions')
      .find({ userId: new ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .toArray();
    
    return { 
      data: sessions, 
      error: null 
    };
  } catch (error) {
    return { 
      data: null, 
      error: { message: error.message }
    };
  }
}

export async function getChatMessages(sessionId) {
  try {
    const db = mongodb.getDb();
    
    const messages = await db.collection('messages')
      .find({ sessionId: new ObjectId(sessionId) })
      .sort({ createdAt: 1 })
      .toArray();
    
    return { 
      data: messages, 
      error: null 
    };
  } catch (error) {
    return { 
      data: null, 
      error: { message: error.message }
    };
  }
}

// Message functions
export async function saveMessage(sessionId, userId, role, content) {
  try {
    console.log('[DEBUG] Saving message for session:', sessionId, 'role:', role);
    const db = mongodb.getDb();
    
    const newMessage = {
      sessionId: new ObjectId(sessionId),
      userId: new ObjectId(userId),
      role: role,
      content: content,
      createdAt: new Date()
    };

    const result = await db.collection('messages').insertOne(newMessage);
    console.log('[DEBUG] Message saved with ID:', result.insertedId);
    
    return { 
      data: result.insertedId, 
      error: null 
    };
  } catch (error) {
    console.error('[ERROR] Failed to save message:', error);
    return { 
      data: null, 
      error: { message: error.message }
    };
  }
}

export async function updateChatTitle(sessionId, title) {
  try {
    const db = mongodb.getDb();
    
    const result = await db.collection('chat_sessions').updateOne(
      { _id: new ObjectId(sessionId) },
      { 
        $set: { 
          title: title, 
          updatedAt: new Date() 
        }
      }
    );
    
    return { 
      data: result.modifiedCount > 0, 
      error: null 
    };
  } catch (error) {
    return { 
      data: null, 
      error: { message: error.message }
    };
  }
}

// User profile functions
export async function createUserProfile(userId, email, fullName, mobile) {
  try {
    const db = mongodb.getDb();
    
    const newProfile = {
      _id: new ObjectId(userId),
      email,
      fullName,
      mobile,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('profiles').insertOne(newProfile);
    
    return { 
      data: result.insertedId, 
      error: null 
    };
  } catch (error) {
    return { 
      data: null, 
      error: { message: error.message }
    };
  }
}