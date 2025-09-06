import mongoose from 'mongoose'

// File metadata schema
const fileMetadataSchema = new mongoose.Schema({
   id: { type: String, required: true, unique: true },
   originalName: { type: String, required: true },
   fileName: { type: String, required: true },
   uploadDate: { type: Date, default: Date.now },
   size: {
      type: Number,
      required: true,
      max: [1048576, 'File size cannot exceed 1MB'] // 1MB limit
   },
   rowCount: {
      type: Number,
      default: 0,
      max: [1000, 'Row count cannot exceed 1000 for AI analysis']
   },
   headers: {
      type: [{ type: String }],
      validate: {
         validator: function (v) {
            return v.length <= 10
         },
         message: 'Cannot have more than 10 columns for AI analysis'
      }
   },
   filePath: { type: String, required: true },
   data: { type: mongoose.Schema.Types.Mixed }, // Store actual data
   createdAt: { type: Date, default: Date.now },
   updatedAt: { type: Date, default: Date.now }
})

// Update the updatedAt field before saving
fileMetadataSchema.pre('save', function (next) {
   this.updatedAt = Date.now()
   next()
})

// Create the model
const FileMetadata = mongoose.model('FileMetadata', fileMetadataSchema)

// Database connection function
const connectDB = async () => {
   try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xlsx-visualizer'

      await mongoose.connect(mongoURI)

      console.log('✅ MongoDB connected successfully')

      // Set up connection event listeners
      mongoose.connection.on('error', (err) => {
         console.error('❌ MongoDB connection error:', err)
      })

      mongoose.connection.on('disconnected', () => {
         console.log('⚠️ MongoDB disconnected')
      })

      process.on('SIGINT', async () => {
         await mongoose.connection.close()
         console.log('MongoDB connection closed through app termination')
         process.exit(0)
      })

   } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message)
      process.exit(1)
   }
}

export { FileMetadata, connectDB }
