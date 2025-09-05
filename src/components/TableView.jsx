import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, FileSpreadsheet, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react'
import useExcelStore from '@/store/useExcelStore'

const TableView = () => {
   const [searchTerm, setSearchTerm] = useState('')
   const [currentPage, setCurrentPage] = useState(1)
   const [rowsPerPage] = useState(50)

   const navigate = useNavigate()
   const { data, headers, fileName, isDataLoaded } = useExcelStore()

   // Filter data based on search term
   const filteredData = useMemo(() => {
      if (!searchTerm) return data

      return data.filter(row =>
         Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
         )
      )
   }, [data, searchTerm])

   // Pagination
   const totalPages = Math.ceil(filteredData.length / rowsPerPage)
   const startIndex = (currentPage - 1) * rowsPerPage
   const endIndex = startIndex + rowsPerPage
   const paginatedData = filteredData.slice(startIndex, endIndex)

   // Reset page when search changes
   React.useEffect(() => {
      setCurrentPage(1)
   }, [searchTerm])

   if (!isDataLoaded) {
      return (
         <div className="text-center py-12">
            <Card className="max-w-md mx-auto">
               <CardContent className="pt-6">
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Data Loaded</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                     Please upload an Excel file to view your data
                  </p>
                  <Button onClick={() => navigate('/')}>
                     Upload File
                  </Button>
               </CardContent>
            </Card>
         </div>
      )
   }

   return (
      <div className="space-y-6">
         {/* Header */}
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                     <FileSpreadsheet className="h-5 w-5" />
                     <span>Table View</span>
                  </div>
                  <Button
                     onClick={() => navigate('/visualize')}
                     className="flex items-center space-x-2"
                  >
                     <BarChart3 className="h-4 w-4" />
                     <span>Visualize Data</span>
                  </Button>
               </CardTitle>
               <CardDescription>
                  Viewing data from: <strong>{fileName}</strong> ({data.length} rows, {headers.length} columns)
               </CardDescription>
            </CardHeader>
         </Card>

         {/* Search and Filters */}
         <Card>
            <CardContent className="pt-6">
               <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                     <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                     <Input
                        placeholder="Search across all columns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                     />
                  </div>
                  <div className="text-sm text-muted-foreground">
                     {filteredData.length} of {data.length} rows
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Data Table */}
         <Card>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead className="w-12">#</TableHead>
                           {headers.map((header) => (
                              <TableHead key={header} className="min-w-32">
                                 {header}
                              </TableHead>
                           ))}
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {paginatedData.map((row, index) => (
                           <TableRow key={startIndex + index}>
                              <TableCell className="font-medium text-muted-foreground">
                                 {startIndex + index + 1}
                              </TableCell>
                              {headers.map((header) => (
                                 <TableCell key={header}>
                                    {String(row[header] || '')}
                                 </TableCell>
                              ))}
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </div>
            </CardContent>
         </Card>

         {/* Pagination */}
         {totalPages > 1 && (
            <Card>
               <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                     <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} rows
                     </div>

                     <div className="flex items-center space-x-2">
                        <Button
                           variant="outline"
                           size="sm"
                           onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                           disabled={currentPage === 1}
                        >
                           <ChevronLeft className="h-4 w-4" />
                           Previous
                        </Button>

                        <div className="text-sm">
                           Page {currentPage} of {totalPages}
                        </div>

                        <Button
                           variant="outline"
                           size="sm"
                           onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                           disabled={currentPage === totalPages}
                        >
                           Next
                           <ChevronRight className="h-4 w-4" />
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>
         )}
      </div>
   )
}

export default TableView
