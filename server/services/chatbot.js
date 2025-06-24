import { mongodb } from '../config/mongodb.js'
import { getChatCompletion, GROQ_MODELS } from './groq.js'
import { 
  createChatSession, 
  saveMessage, 
  getChatMessages,
  updateChatTitle 
} from '../config/database.js'

export class ChatBot {
  constructor(userId) {
    this.userId = userId
    this.currentSessionId = null
    this.model = GROQ_MODELS.LLAMA_8B // Fast model for quick responses
  }

  // Start new chat session
  async startNewChat(title = 'New Chat') {
    const { data: sessionId, error } = await createChatSession(title, this.userId)
    if (error) throw new Error(`Failed to create session: ${error.message}`)
    
    this.currentSessionId = sessionId
    return sessionId
  }

  // Load existing chat session
  async loadChat(sessionId) {
    this.currentSessionId = sessionId
    const { data: messages, error } = await getChatMessages(sessionId)
    
    if (error) throw new Error(`Failed to load chat: ${error.message}`)
    return messages
  }

  // Send message and get AI response
  async sendMessage(userMessage, sessionId = null) {
    const targetSessionId = sessionId || this.currentSessionId
    
    if (!targetSessionId) {
      throw new Error('No active chat session')
    }

    try {
      // Save user message
      const { error: userError } = await saveMessage(
        targetSessionId, 
        this.userId,
        'user', 
        userMessage
      )
      if (userError) throw new Error(`Failed to save user message: ${userError.message}`)

      // Get chat history for context
      const { data: chatHistory } = await getChatMessages(targetSessionId)
      
      // Format messages for Groq API
      const messages = this.formatMessagesForGroq(chatHistory)
      messages.push({ role: 'user', content: userMessage })

      // Get AI response
      const { content: aiResponse, usage, error: groqError } = await getChatCompletion(
        messages, 
        this.model
      )

      if (groqError) {
        throw new Error(`Groq API error: ${groqError}`)
      }      // Save AI response
      const { error: aiError } = await saveMessage(
        targetSessionId, 
        this.userId,
        'assistant', 
        aiResponse
      )
      if (aiError) throw new Error(`Failed to save AI message: ${aiError.message}`)

      // Auto-generate title for first exchange
      if (chatHistory.length === 0) {
        await this.generateChatTitle(targetSessionId, userMessage, aiResponse)
      }

      return {
        response: aiResponse,
        usage: usage,
        sessionId: targetSessionId
      }

    } catch (error) {
      console.error('Chat error:', error)
      throw error
    }
  }

  // Format chat history for Groq API
  formatMessagesForGroq(chatHistory) {
    return chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
  }

  // Auto-generate chat title
  async generateChatTitle(sessionId, userMessage, aiResponse) {
    try {
      const titlePrompt = [
        {
          role: 'system',
          content: 'Generate a short, descriptive title (max 50 characters) for this conversation. Only return the title, nothing else.'
        },
        {
          role: 'user',
          content: `User: ${userMessage}\nAssistant: ${aiResponse}`
        }
      ]

      const { content: title } = await getChatCompletion(titlePrompt, GROQ_MODELS.LLAMA_8B)
      
      if (title) {
        await updateChatTitle(sessionId, title.trim().replace(/['"]/g, ''))
      }
    } catch (error) {
      console.log('Failed to generate title:', error)
      // Don't throw - title generation is optional
    }
  }

  // Switch model
  setModel(model) {
    this.model = model
  }

  // Get current session
  getCurrentSession() {
    return this.currentSessionId
  }
}