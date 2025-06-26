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
    
    // System prompt for government services assistant
    this.systemPrompt = `You are Jante ChAi, a helpful AI assistant for Bangladeshi government services. You help users with information about:

- National ID (NID) services
- Passport services  
- Birth certificate services
- Driving license services
- Tax services
- Other government services

Key guidelines:
1. Provide accurate, helpful information about government procedures
2. Be polite and professional
3. If you don't know specific details, suggest contacting the relevant government office
4. Always respond in the language of the user's question
5. Keep responses concise but informative
6. Focus on practical steps and requirements
7. Mention relevant fees and timelines when possible
8. Make responses concise and to the point, prompt the user for more information
9. If the user asks about a specific service, provide a link to the relevant government website

RESPONSE STYLE:
- Be CONCISE: Keep responses under 3-4 sentences when possible
- Be PROMPTFUL: Ask follow-up questions to guide users to the next step
- Be DIRECT: Get straight to the point without unnecessary explanations
- Be ACTION-ORIENTED: Always suggest the next step or action the user should take
- Use BULLET POINTS for lists of requirements or steps
- If the user's question is unclear, ask ONE specific clarifying question

Examples of good responses:
- "To apply for a passport, you need: 
• Valid NID 
• 2 passport photos 
• Application fee

What type of passport do you need?"
- "For birth certificate, visit your local Union Parishad with: 
• Parent's NID 
• Hospital certificate. 
When was the child born?"
- "I need more details. Are you applying for a new NID or updating an existing one?"

Always be helpful and guide users to the right resources.`
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
      }

      // Save AI response
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
    const messages = [
      { role: 'system', content: this.systemPrompt }
    ]
    
    // Add chat history (limit to last 10 messages to avoid token limits)
    const recentHistory = chatHistory.slice(-10)
    messages.push(...recentHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })))
    
    return messages
  }

  // Auto-generate chat title
  async generateChatTitle(sessionId, userMessage, aiResponse) {
    try {
      const titlePrompt = [
        {
          role: 'system',
          content: 'Generate a short, descriptive title (max 50 characters) for this conversation about government services. Only return the title, nothing else.'
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