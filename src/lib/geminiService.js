import { GoogleGenerativeAI } from '@google/generative-ai'

class GeminiService {
   constructor() {
      this.apiKey = import.meta.env.VITE_GEMINI_API_KEY
      this.genAI = null
      this.model = null
      this.isInitialized = false

      // Data limits for AI analysis
      this.MAX_ROWS = 15
      this.MAX_COLUMNS = 10
      this.MAX_DATASET_SIZE = 1000 // Maximum total rows in dataset
   }

   async initialize() {
      if (this.isInitialized) return true

      try {
         if (!this.apiKey) {
            throw new Error('Gemini API key not found. Please check your .env file.')
         }

         this.genAI = new GoogleGenerativeAI(this.apiKey)
         this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
         this.isInitialized = true
         return true
      } catch (error) {
         console.error('Failed to initialize Gemini:', error)
         return false
      }
   }

   validateDataSize(data, headers) {
      const errors = []

      if (data.length > this.MAX_DATASET_SIZE) {
         errors.push(`Dataset too large (${data.length} rows). Maximum allowed: ${this.MAX_DATASET_SIZE} rows`)
      }

      if (headers.length > this.MAX_COLUMNS) {
         errors.push(`Too many columns (${headers.length}). Maximum allowed: ${this.MAX_COLUMNS} columns`)
      }

      return errors
   }

   async analyzeData(data, headers, question) {
      await this.initialize()

      if (!this.isInitialized) {
         throw new Error('Gemini service not initialized')
      }

      // Validate data size
      const validationErrors = this.validateDataSize(data, headers)
      if (validationErrors.length > 0) {
         throw new Error(validationErrors.join('. '))
      }

      try {
         // Limit data sample and columns
         const limitedHeaders = headers.slice(0, this.MAX_COLUMNS)
         const sampleData = data.slice(0, this.MAX_ROWS).map(row => {
            const limitedRow = {}
            limitedHeaders.forEach(header => {
               limitedRow[header] = row[header]
            })
            return limitedRow
         })

         // Create a concise prompt for short responses
         const prompt = `Analyze this data sample and answer: "${question}"

Headers: ${limitedHeaders.join(', ')}
Sample (${sampleData.length} of ${data.length} rows):
${JSON.stringify(sampleData, null, 1)}

IMPORTANT: Answer in exactly 2-3 sentences, maximum 100 words. Be direct and specific.`

         const result = await this.model.generateContent(prompt)
         const response = await result.response
         const text = response.text()

         // Truncate if response is too long
         if (text.length > 500) {
            return text.substring(0, 497) + '...'
         }

         return text

      } catch (error) {
         console.error('Error analyzing data with Gemini:', error)

         // Handle specific error types
         if (error.message.includes('API_KEY_INVALID')) {
            throw new Error('Invalid API key. Please check your Gemini API key.')
         } else if (error.message.includes('QUOTA_EXCEEDED')) {
            throw new Error('API quota exceeded. Please try again later.')
         } else if (error.message.includes('SAFETY')) {
            throw new Error('Content blocked by safety filters. Please rephrase your question.')
         } else {
            throw new Error('Failed to analyze data. Please try again.')
         }
      }
   }

   async getDataInsights(data, headers) {
      // Check data limits
      const validationErrors = this.validateDataSize(data, headers)
      if (validationErrors.length > 0) {
         return `⚠️ ${validationErrors.join('. ')}\n\nFor AI analysis, please use smaller datasets.`
      }

      const limitedHeaders = headers.slice(0, this.MAX_COLUMNS)
      const insights = [
         `📊 Dataset: ${data.length} rows × ${headers.length} columns`,
         `📋 Columns: ${limitedHeaders.join(', ')}${headers.length > this.MAX_COLUMNS ? ` (+${headers.length - this.MAX_COLUMNS} more)` : ''}`
      ]

      // Add basic statistics for numeric columns
      const numericColumns = limitedHeaders.filter(header => {
         const sampleValues = data.slice(0, 10).map(row => row[header])
         return sampleValues.some(val => !isNaN(parseFloat(val)) && isFinite(val))
      })

      if (numericColumns.length > 0) {
         insights.push(`🔢 Numeric columns: ${numericColumns.join(', ')}`)
      }

      insights.push(`✨ AI Analysis ready for datasets up to ${this.MAX_DATASET_SIZE} rows and ${this.MAX_COLUMNS} columns`)

      return insights.join('\n')
   }

   getDataLimits() {
      return {
         maxRows: this.MAX_ROWS,
         maxColumns: this.MAX_COLUMNS,
         maxDatasetSize: this.MAX_DATASET_SIZE
      }
   }
}

export default new GeminiService()
