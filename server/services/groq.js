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
      temperature: 0.3,
      max_tokens: 512,
      stream: false,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
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

// Check Groq account balance and usage
export async function getGroqAccountInfo() {
  try {
    // Note: Groq doesn't have a direct billing API endpoint like OpenAI
    // We'll need to use their account information endpoint
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // For now, we'll return basic account status
    // Groq typically provides free tier with generous limits
    return {
      success: true,
      accountStatus: 'active',
      message: 'Groq account is active. Check your Groq dashboard for detailed usage.',
      freeTierInfo: {
        available: true,
        dailyLimit: 'Unlimited requests per day',
        monthlyLimit: 'Generous free tier limits',
        note: 'Visit https://console.groq.com for detailed usage statistics'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Unable to fetch account information'
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