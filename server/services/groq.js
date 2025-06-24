import Groq from 'groq-sdk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Read from environment variable
  dangerouslyAllowBrowser: true // Only if using in browser
})

export async function getChatCompletion(messages, model = 'llama-3.1-70b-versatile') {
  try {
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: model,
      temperature: 0.7,
      max_tokens: 1024,
      stream: false
    })
    
    return {
      content: completion.choices[0].message.content,
      usage: completion.usage,
      error: null
    }
  } catch (error) {
    return {
      content: null,
      usage: null,
      error: error.message
    }
  }
}

// Available Groq models
export const GROQ_MODELS = {
  LLAMA_70B: 'llama-3.1-70b-versatile',
  LLAMA_8B: 'llama-3.1-8b-instant',
  MIXTRAL: 'mixtral-8x7b-32768',
  GEMMA_7B: 'gemma-7b-it'
}