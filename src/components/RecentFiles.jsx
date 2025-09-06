import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, Calendar, FileText, Trash2, Eye, Upload } from 'lucide-react'
import useExcelStore from '@/store/useExcelStore'

const RecentFiles = () => {
   const [recentFiles, setRecentFiles] = useState([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState('')

   const navigate = useNavigate()
   const setData = useExcelStore(state => state.setData)

   useEffect(() => {
      fetchRecentFiles()
   }, [])

   const fetchRecentFiles = async () => {
      try {
         setLoading(true)
         const response = await fetch('http://localhost:3001/api/recent-files')
         if (!response.ok) throw new Error('Failed to fetch recent files')

         const files = await response.json()
         setRecentFiles(files)
      } catch (err) {
         setError('Failed to load recent files. Make sure the server is running.')
         console.error('Error fetching recent files:', err)
      } finally {
         setLoading(false)
      }
   }

   const loadFile = async (fileId) => {
      try {
         const response = await fetch(`http://localhost:3001/api/file/${fileId}`)
         if (!response.ok) throw new Error('Failed to load file data')

         const fileData = await response.json()
         setData(fileData.data, fileData.headers, fileData.metadata.originalName)
         navigate('/table')
      } catch (err) {
         setError('Failed to load file data')
         console.error('Error loading file:', err)
      }
   }

   const deleteFile = async (fileId, fileName) => {
      if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return

      try {
         const response = await fetch(`http://localhost:3001/api/file/${fileId}`, {
            method: 'DELETE'
         })

         if (!response.ok) throw new Error('Failed to delete file')

         setRecentFiles(files => files.filter(file => file.id !== fileId))
      } catch (err) {
         setError('Failed to delete file')
         console.error('Error deleting file:', err)
      }
   }

   const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
         hour: '2-digit',
         minute: '2-digit'
      })
   }

   const formatFileSize = (bytes) => {
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      if (bytes === 0) return '0 Bytes'
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
   }

   if (loading) {
      return (
         <div className="max-w-4xl mx-auto">
            <Card>
               <CardContent className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading recent files...</span>
               </CardContent>
            </Card>
         </div>
      )
   }

   return (
      <div className="max-w-4xl mx-auto space-y-6">
         {/* Error Message */}
         {error && (
            <Card className="border-red-200">
               <CardContent className="p-4">
                  <div className="text-red-600 text-center">{error}</div>
               </CardContent>
            </Card>
         )}

         {/* Recent Files */}
         {recentFiles.length > 0 ? (
            <Card>
               <CardHeader>
                  <CardTitle>Recent Files</CardTitle>
                  <CardDescription>
                     Your last {recentFiles.length} uploaded file(s)
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="space-y-4">
                     {recentFiles.map((file) => (
                        <div
                           key={file.id}
                           className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                           <div className="flex items-center space-x-4 flex-1">
                              <FileText className="h-8 w-8 text-blue-500" />
                              <div className="flex-1 min-w-0">
                                 <h3 className="font-medium truncate">{file.originalName}</h3>
                                 <div className="text-sm text-gray-500 space-y-1">
                                    <div className="flex items-center space-x-4">
                                       <span className="flex items-center">
                                          <Calendar className="h-3 w-3 mr-1" />
                                          {formatDate(file.uploadDate)}
                                       </span>
                                       <span>{formatFileSize(file.size)}</span>
                                       <span>{file.rowCount} rows</span>
                                    </div>
                                    <div className="text-xs">
                                       Columns: {file.headers.slice(0, 3).join(', ')}
                                       {file.headers.length > 3 && ` +${file.headers.length - 3} more`}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center space-x-2">
                              <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => loadFile(file.id)}
                              >
                                 <Eye className="h-4 w-4 mr-1" />
                                 Load
                              </Button>
                              <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => deleteFile(file.id, file.originalName)}
                                 className="text-red-600 hover:text-red-700"
                              >
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         ) : (
            <Card>
               <CardContent className="text-center p-8">
                  <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recent files</h3>
                  <p className="text-gray-500 mb-4">
                     Upload your first Excel or CSV file to get started
                  </p>
                  <Button onClick={() => navigate('/upload')}>
                     <Upload className="h-4 w-4 mr-2" />
                     Upload File
                  </Button>
               </CardContent>
            </Card>
         )}
      </div>
   )
}

export default RecentFiles
