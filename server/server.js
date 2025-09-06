import express from 'express'
import multer from 'multer'
import cors from 'cors'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { FileMetadata, connectDB } from './database.js'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Connect to MongoDB
await connectDB()

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads')
fs.ensureDirSync(uploadsDir)

// Configure multer for file uploads
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, uploadsDir)
   },
   filename: (req, file, cb) => {
      const timestamp = Date.now()
      const originalName = file.originalname
      cb(null, `${timestamp}-${originalName}`)
   }
})

const upload = multer({
   storage,
   limits: {
      fileSize: 1024 * 1024, // 1MB limit
      files: 1 // Only allow 1 file at a time
   },
   fileFilter: (req, file, cb) => {
      // Allow only Excel and CSV files
      const allowedTypes = [
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         'application/vnd.ms-excel',
         'text/csv'
      ]

      if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
         cb(null, true)
      } else {
         cb(new Error('Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed'), false)
      }
   }
})

// File metadata storage (MongoDB integration + local backup)
const metadataFile = path.join(__dirname, 'file-metadata.json')

// Ensure metadata file exists (as backup)
if (!fs.existsSync(metadataFile)) {
   fs.writeFileSync(metadataFile, JSON.stringify([]))
}

// Helper function to read metadata (with MongoDB fallback to local file)
const readMetadata = async () => {
   try {
      // Try MongoDB first
      const metadata = await FileMetadata.find().sort({ uploadDate: -1 }).lean()
      return metadata.map(doc => ({
         id: doc.id,
         originalName: doc.originalName,
         fileName: doc.fileName,
         uploadDate: doc.uploadDate,
         size: doc.size,
         rowCount: doc.rowCount,
         headers: doc.headers,
         filePath: doc.filePath
      }))
   } catch (error) {
      console.error('MongoDB read error, falling back to local file:', error)
      // Fallback to local file
      try {
         const data = fs.readFileSync(metadataFile, 'utf8')
         return JSON.parse(data)
      } catch (fileError) {
         console.error('Local file read error:', fileError)
         return []
      }
   }
}

// Helper function to write metadata (to both MongoDB and local file)
const writeMetadata = async (metadata) => {
   try {
      // Save to local file as backup
      fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2))
   } catch (error) {
      console.error('Error writing to local backup file:', error)
   }
}

// Routes

// Get recent files (last 5)
app.get('/api/recent-files', async (req, res) => {
   try {
      const metadata = await readMetadata()
      const recentFiles = metadata
         .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
         .slice(0, 5)

      res.json(recentFiles)
   } catch (error) {
      console.error('Error fetching recent files:', error)
      res.status(500).json({ error: 'Failed to fetch recent files' })
   }
})

// Upload file and save data
app.post('/api/upload', (req, res) => {
   upload.single('file')(req, res, async (err) => {
      try {
         if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
               return res.status(400).json({
                  error: 'File too large. Maximum file size is 1MB.'
               })
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
               return res.status(400).json({
                  error: 'Too many files. Please upload one file at a time.'
               })
            }
            if (err.message.includes('Invalid file type')) {
               return res.status(400).json({
                  error: 'Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed.'
               })
            }
            return res.status(400).json({
               error: err.message || 'File upload failed.'
            })
         }

         if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' })
         }

         const { data, headers } = req.body

         // Parse data if it's a string
         const parsedData = typeof data === 'string' ? JSON.parse(data) : data
         const parsedHeaders = typeof headers === 'string' ? JSON.parse(headers) : headers

         // Additional validation for data size
         if (parsedData && parsedData.length > 1000) {
            return res.status(400).json({
               error: 'Dataset too large. Maximum 1,000 rows allowed for AI analysis.'
            })
         }

         if (parsedHeaders && parsedHeaders.length > 10) {
            return res.status(400).json({
               error: 'Too many columns. Maximum 10 columns allowed for AI analysis.'
            })
         }

         // Create metadata entry
         const fileMetadata = {
            id: Date.now().toString(),
            originalName: req.file.originalname,
            fileName: req.file.filename,
            uploadDate: new Date().toISOString(),
            size: req.file.size,
            rowCount: parsedData ? parsedData.length : 0,
            headers: parsedHeaders || [],
            filePath: req.file.path,
            data: parsedData // Store data in MongoDB
         }

         try {
            // Save to MongoDB
            const mongoDoc = new FileMetadata(fileMetadata)
            await mongoDoc.save()
            console.log('✅ File metadata saved to MongoDB')
         } catch (mongoError) {
            console.error('❌ MongoDB save error:', mongoError)
            // Continue with local storage as fallback
         }

         // Save data as JSON for local backup
         const dataFilePath = path.join(uploadsDir, `${fileMetadata.id}-data.json`)
         fs.writeFileSync(dataFilePath, JSON.stringify({
            data: parsedData,
            headers: parsedHeaders,
            metadata: fileMetadata
         }, null, 2))

         // Update local metadata backup
         const metadata = await readMetadata()
         metadata.push(fileMetadata)

         // Keep only last 10 files (to manage storage)
         if (metadata.length > 10) {
            const oldFiles = metadata.slice(0, metadata.length - 10)

            for (const file of oldFiles) {
               try {
                  // Remove from MongoDB
                  await FileMetadata.deleteOne({ id: file.id })

                  // Remove local files
                  fs.removeSync(file.filePath)
                  const dataPath = path.join(uploadsDir, `${file.id}-data.json`)
                  if (fs.existsSync(dataPath)) {
                     fs.removeSync(dataPath)
                  }
               } catch (error) {
                  console.error('Error removing old file:', error)
               }
            }
         }

         await writeMetadata(metadata)

         res.json({
            success: true,
            fileId: fileMetadata.id,
            metadata: fileMetadata
         })

      } catch (error) {
         console.error('Upload error:', error)
         res.status(500).json({ error: 'Upload failed: ' + error.message })
      }
   })
})

// Get file data by ID
app.get('/api/file/:id', async (req, res) => {
   try {
      const { id } = req.params

      try {
         // Try MongoDB first
         const mongoDoc = await FileMetadata.findOne({ id }).lean()
         if (mongoDoc) {
            res.json({
               data: mongoDoc.data,
               headers: mongoDoc.headers,
               metadata: {
                  id: mongoDoc.id,
                  originalName: mongoDoc.originalName,
                  fileName: mongoDoc.fileName,
                  uploadDate: mongoDoc.uploadDate,
                  size: mongoDoc.size,
                  rowCount: mongoDoc.rowCount,
                  headers: mongoDoc.headers,
                  filePath: mongoDoc.filePath
               }
            })
            return
         }
      } catch (mongoError) {
         console.error('MongoDB read error, falling back to local file:', mongoError)
      }

      // Fallback to local file
      const dataFilePath = path.join(uploadsDir, `${id}-data.json`)
      if (!fs.existsSync(dataFilePath)) {
         return res.status(404).json({ error: 'File not found' })
      }

      const fileData = fs.readFileSync(dataFilePath, 'utf8')
      const parsedData = JSON.parse(fileData)

      res.json(parsedData)
   } catch (error) {
      console.error('Error fetching file data:', error)
      res.status(500).json({ error: 'Failed to fetch file data' })
   }
})

// Delete file
app.delete('/api/file/:id', async (req, res) => {
   try {
      const { id } = req.params

      try {
         // Remove from MongoDB
         const deletedDoc = await FileMetadata.findOneAndDelete({ id })
         if (!deletedDoc) {
            return res.status(404).json({ error: 'File not found in database' })
         }

         // Remove local files
         try {
            fs.removeSync(deletedDoc.filePath)
            const dataPath = path.join(uploadsDir, `${id}-data.json`)
            if (fs.existsSync(dataPath)) {
               fs.removeSync(dataPath)
            }
         } catch (fileError) {
            console.error('Error removing local files:', fileError)
         }

         res.json({ success: true })
         return

      } catch (mongoError) {
         console.error('MongoDB delete error, falling back to local metadata:', mongoError)
      }

      // Fallback to local metadata
      const metadata = await readMetadata()
      const fileIndex = metadata.findIndex(file => file.id === id)

      if (fileIndex === -1) {
         return res.status(404).json({ error: 'File not found' })
      }

      const file = metadata[fileIndex]

      // Remove files
      try {
         fs.removeSync(file.filePath)
         const dataPath = path.join(uploadsDir, `${id}-data.json`)
         if (fs.existsSync(dataPath)) {
            fs.removeSync(dataPath)
         }
      } catch (error) {
         console.error('Error removing files:', error)
      }

      // Update metadata
      metadata.splice(fileIndex, 1)
      await writeMetadata(metadata)

      res.json({ success: true })
   } catch (error) {
      console.error('Error deleting file:', error)
      res.status(500).json({ error: 'Failed to delete file' })
   }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
   res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
   })
})

app.listen(PORT, '0.0.0.0', () => {
   console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
   console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
   console.log(`🗄️ MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`)
})

export default app
