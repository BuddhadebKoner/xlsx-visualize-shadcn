import express from 'express'
import multer from 'multer'
import cors from 'cors'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

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
         cb(new Error('Invalid file type'), false)
      }
   }
})

// File metadata storage (in production, use a database)
const metadataFile = path.join(__dirname, 'file-metadata.json')

// Ensure metadata file exists
if (!fs.existsSync(metadataFile)) {
   fs.writeFileSync(metadataFile, JSON.stringify([]))
}

// Helper function to read metadata
const readMetadata = () => {
   try {
      const data = fs.readFileSync(metadataFile, 'utf8')
      return JSON.parse(data)
   } catch (error) {
      return []
   }
}

// Helper function to write metadata
const writeMetadata = (metadata) => {
   fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2))
}

// Routes

// Get recent files (last 5)
app.get('/api/recent-files', (req, res) => {
   try {
      const metadata = readMetadata()
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
app.post('/api/upload', upload.single('file'), (req, res) => {
   try {
      if (!req.file) {
         return res.status(400).json({ error: 'No file uploaded' })
      }

      const { data, headers } = req.body

      // Parse data if it's a string
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data
      const parsedHeaders = typeof headers === 'string' ? JSON.parse(headers) : headers

      // Create metadata entry
      const fileMetadata = {
         id: Date.now().toString(),
         originalName: req.file.originalname,
         fileName: req.file.filename,
         uploadDate: new Date().toISOString(),
         size: req.file.size,
         rowCount: parsedData ? parsedData.length : 0,
         headers: parsedHeaders || [],
         filePath: req.file.path
      }

      // Save data as JSON for easy retrieval
      const dataFilePath = path.join(uploadsDir, `${fileMetadata.id}-data.json`)
      fs.writeFileSync(dataFilePath, JSON.stringify({
         data: parsedData,
         headers: parsedHeaders,
         metadata: fileMetadata
      }, null, 2))

      // Update metadata
      const metadata = readMetadata()
      metadata.push(fileMetadata)

      // Keep only last 10 files (to manage storage)
      if (metadata.length > 10) {
         const oldFiles = metadata.slice(0, metadata.length - 10)
         oldFiles.forEach(file => {
            try {
               fs.removeSync(file.filePath)
               const dataPath = path.join(uploadsDir, `${file.id}-data.json`)
               if (fs.existsSync(dataPath)) {
                  fs.removeSync(dataPath)
               }
            } catch (error) {
               console.error('Error removing old file:', error)
            }
         })
         metadata.splice(0, metadata.length - 10)
      }

      writeMetadata(metadata)

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

// Get file data by ID
app.get('/api/file/:id', (req, res) => {
   try {
      const { id } = req.params
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
app.delete('/api/file/:id', (req, res) => {
   try {
      const { id } = req.params
      const metadata = readMetadata()
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
      writeMetadata(metadata)

      res.json({ success: true })
   } catch (error) {
      console.error('Error deleting file:', error)
      res.status(500).json({ error: 'Failed to delete file' })
   }
})

app.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT}`)
})

export default app
