import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowLeft, Brain } from 'lucide-react'
import useExcelStore from '@/store/useExcelStore'

const FileUpload = () => {
   const [isDragOver, setIsDragOver] = useState(false)
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState('')
   const [success, setSuccess] = useState('')

   const navigate = useNavigate()
   const setData = useExcelStore(state => state.setData)
   const clearData = useExcelStore(state => state.clearData)

   const processFile = useCallback(async (file) => {
      if (!file) return

      // Validate file type
      const validTypes = [
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         'application/vnd.ms-excel',
         'text/csv'
      ]

      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
         setError('Please upload a valid Excel (.xlsx, .xls) or CSV file')
         return
      }

      setIsLoading(true)
      setError('')
      setSuccess('')

      try {
         const reader = new FileReader()

         reader.onload = async (e) => {
            try {
               const data = e.target.result
               const workbook = XLSX.read(data, { type: 'array' })

               // Get first worksheet
               const worksheetName = workbook.SheetNames[0]
               const worksheet = workbook.Sheets[worksheetName]

               // Convert to JSON
               const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

               if (jsonData.length === 0) {
                  setError('The file appears to be empty')
                  setIsLoading(false)
                  return
               }

               // Extract headers and data
               const headers = jsonData[0]
               const rows = jsonData.slice(1).map(row => {
                  const obj = {}
                  headers.forEach((header, index) => {
                     obj[header] = row[index] || ''
                  })
                  return obj
               })

               // Store in Zustand
               setData(rows, headers, file.name)

               // Send to server
               try {
                  const formData = new FormData()
                  formData.append('file', file)
                  formData.append('data', JSON.stringify(rows))
                  formData.append('headers', JSON.stringify(headers))

                  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'
                  const response = await fetch(`${serverUrl}/api/upload`, {
                     method: 'POST',
                     body: formData
                  })

                  if (!response.ok) {
                     throw new Error('Failed to save file to server')
                  }

                  const result = await response.json()
                  console.log('File saved to server:', result)
               } catch (serverError) {
                  console.error('Server upload error:', serverError)
                  // Don't fail the entire process if server save fails
                  setError('File processed locally but failed to save to server. You can still use the data.')
               }

               setSuccess(`Successfully loaded ${rows.length} rows from ${file.name}`)
               setIsLoading(false)

               // Remove automatic navigation - let user choose what to do next

            } catch (parseError) {
               console.error('Parse error:', parseError)
               setError('Error parsing the file. Please ensure it\'s a valid Excel or CSV file.')
               setIsLoading(false)
            }
         }

         reader.onerror = () => {
            setError('Error reading the file')
            setIsLoading(false)
         }

         reader.readAsArrayBuffer(file)

      } catch (err) {
         console.error('File processing error:', err)
         setError('An unexpected error occurred while processing the file')
         setIsLoading(false)
      }
   }, [setData, navigate])

   const handleDrop = useCallback((e) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
         processFile(files[0])
      }
   }, [processFile])

   const handleDragOver = useCallback((e) => {
      e.preventDefault()
      setIsDragOver(true)
   }, [])

   const handleDragLeave = useCallback((e) => {
      e.preventDefault()
      setIsDragOver(false)
   }, [])

   const handleFileInput = (e) => {
      const file = e.target.files[0]
      if (file) {
         processFile(file)
      }
   }

   const handleClearData = () => {
      clearData()
      setSuccess('')
      setError('')
   }

   return (
      <div className="max-w-2xl mx-auto">
         {/* Back button */}
         <div className="mb-4">
            <Button
               variant="outline"
               onClick={() => navigate('/')}
               className="flex items-center space-x-2"
            >
               <ArrowLeft className="h-4 w-4" />
               <span>Back to Recent Files</span>
            </Button>
         </div>

         <Card>
            <CardHeader className="text-center">
               <CardTitle className="flex items-center justify-center space-x-2">
                  <FileSpreadsheet className="h-6 w-6" />
                  <span>Upload Excel File</span>
               </CardTitle>
               <CardDescription>
                  Upload your Excel (.xlsx, .xls) or CSV file to visualize and analyze your data
               </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
               {/* AI Analysis Requirements Note */}
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                     <Brain className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                     <div className="text-sm">
                        <p className="font-medium text-blue-900 mb-1">AI Analysis Requirements:</p>
                        <ul className="text-blue-700 space-y-1 text-xs">
                           <li>• Maximum 1,000 rows and 10 columns</li>
                           <li>• Clean data with clear column headers</li>
                           <li>• Structured data (no merged cells or complex formatting)</li>
                           <li>• Numeric data should be in proper number format</li>
                        </ul>
                     </div>
                  </div>
               </div>
               {/* Drag and Drop Area */}
               <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver
                     ? 'border-primary bg-primary/10'
                     : 'border-muted-foreground/25 hover:border-primary/50'
                     }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
               >
                  <Upload className={`mx-auto h-12 w-12 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="mt-4">
                     <p className="text-lg font-medium">
                        {isDragOver ? 'Drop your file here' : 'Drag and drop your file here'}
                     </p>
                     <p className="text-sm text-muted-foreground mt-1">
                        or click below to browse
                     </p>
                  </div>
               </div>

               {/* File Input */}
               <div className="space-y-2">
                  <Input
                     type="file"
                     accept=".xlsx,.xls,.csv"
                     onChange={handleFileInput}
                     disabled={isLoading}
                     className="cursor-pointer"
                  />
               </div>

               {/* Status Messages */}
               {isLoading && (
                  <div className="flex items-center space-x-2 text-blue-600">
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                     <span>Processing file...</span>
                  </div>
               )}

               {error && (
                  <div className="flex items-center space-x-2 text-red-600">
                     <AlertCircle className="h-4 w-4" />
                     <span>{error}</span>
                  </div>
               )}

               {success && (
                  <div className="flex items-center space-x-2 text-green-600">
                     <CheckCircle className="h-4 w-4" />
                     <span>{success}</span>
                  </div>
               )}

               {/* Quick Actions */}
               {success && (
                  <div className="space-y-4 pt-4 border-t">
                     {/* Primary Action */}
                     <div className="text-center">
                        <Button
                           onClick={() => navigate('/table')}
                           size="lg"
                           className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                           <FileSpreadsheet className="h-5 w-5" />
                           Start Data Analysis
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                           Begin exploring your data with tables, charts, and AI analysis
                        </p>
                     </div>

                     {/* Secondary Actions */}
                     <div className="space-y-2">
                        <p className="text-sm font-medium text-center">Or jump directly to:</p>
                        <div className="grid grid-cols-2 gap-2">
                           <Button
                              onClick={() => navigate('/visualize')}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                           >
                              <FileSpreadsheet className="h-4 w-4" />
                              Create Charts
                           </Button>
                           <Button
                              onClick={() => navigate('/ai-analysis')}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                           >
                              <Brain className="h-4 w-4" />
                              AI Analysis
                           </Button>
                        </div>
                     </div>
                  </div>
               )}

               {/* Clear Data Button */}
               <div className="pt-4">
                  <Button
                     variant="outline"
                     onClick={handleClearData}
                     className="w-full"
                  >
                     Clear Data
                  </Button>
               </div>
            </CardContent>
         </Card>
      </div>
   )
}

export default FileUpload
