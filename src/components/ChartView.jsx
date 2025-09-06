import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
   LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileSpreadsheet, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Table, Brain } from 'lucide-react'
import useExcelStore from '@/store/useExcelStore'

const ChartView = () => {
   const [chartType, setChartType] = useState('bar')
   const [xAxis, setXAxis] = useState('')
   const [yAxis, setYAxis] = useState('')

   const navigate = useNavigate()
   const { data, headers, fileName, isDataLoaded, getNumericColumns } = useExcelStore()

   const numericColumns = getNumericColumns()
   const categoricalColumns = headers.filter(header => !numericColumns.includes(header))

   // Prepare chart data
   const chartData = useMemo(() => {
      if (!xAxis || !yAxis || !data.length) return []

      // Group data by X-axis values and aggregate Y-axis values
      const grouped = data.reduce((acc, row) => {
         const xValue = String(row[xAxis] || 'Unknown')
         const yValue = parseFloat(row[yAxis]) || 0

         if (acc[xValue]) {
            acc[xValue] += yValue
         } else {
            acc[xValue] = yValue
         }

         return acc
      }, {})

      return Object.entries(grouped).map(([key, value]) => ({
         name: key,
         value: value,
         [yAxis]: value
      }))
   }, [data, xAxis, yAxis])

   // Color palette for charts
   const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0088fe', '#ff0000']

   if (!isDataLoaded) {
      return (
         <div className="text-center py-12">
            <Card className="max-w-md mx-auto">
               <CardContent className="pt-6">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Data to Visualize</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                     Please upload an Excel file to create visualizations
                  </p>
                  <Button onClick={() => navigate('/')}>
                     Upload File
                  </Button>
               </CardContent>
            </Card>
         </div>
      )
   }

   const renderChart = () => {
      if (!xAxis || !yAxis || !chartData.length) {
         return (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
               <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                  <p>Select X and Y axes to generate chart</p>
               </div>
            </div>
         )
      }

      switch (chartType) {
         case 'line':
            return (
               <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="name" />
                     <YAxis />
                     <Tooltip />
                     <Legend />
                     <Line
                        type="monotone"
                        dataKey={yAxis}
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ fill: '#8884d8' }}
                     />
                  </LineChart>
               </ResponsiveContainer>
            )

         case 'bar':
            return (
               <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="name" />
                     <YAxis />
                     <Tooltip />
                     <Legend />
                     <Bar dataKey={yAxis} fill="#8884d8" />
                  </BarChart>
               </ResponsiveContainer>
            )

         case 'pie':
            return (
               <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                     <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                     >
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
            )

         default:
            return null
      }
   }

   return (
      <div className="space-y-6">
         {/* Header */}
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                     <BarChart3 className="h-5 w-5" />
                     <span>Data Visualization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                     <Button
                        variant="outline"
                        onClick={() => navigate('/ai-analysis')}
                        className="flex items-center space-x-2"
                     >
                        <Brain className="h-4 w-4" />
                        <span>Ask AI</span>
                     </Button>
                     <Button
                        variant="outline"
                        onClick={() => navigate('/table')}
                        className="flex items-center space-x-2"
                     >
                        <Table className="h-4 w-4" />
                        <span>View Table</span>
                     </Button>
                  </div>
               </CardTitle>
               <CardDescription>
                  Creating charts from: <strong>{fileName}</strong> ({data.length} rows)
               </CardDescription>
            </CardHeader>
         </Card>

         {/* Chart Controls */}
         <Card>
            <CardHeader>
               <CardTitle>Chart Configuration</CardTitle>
               <CardDescription>
                  Select the chart type and axes to create your visualization
               </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Chart Type */}
                  <div className="space-y-2">
                     <label className="text-sm font-medium">Chart Type</label>
                     <Select value={chartType} onValueChange={setChartType}>
                        <SelectTrigger>
                           <SelectValue placeholder="Select chart type" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="bar">
                              <div className="flex items-center space-x-2">
                                 <BarChart3 className="h-4 w-4" />
                                 <span>Bar Chart</span>
                              </div>
                           </SelectItem>
                           <SelectItem value="line">
                              <div className="flex items-center space-x-2">
                                 <LineChartIcon className="h-4 w-4" />
                                 <span>Line Chart</span>
                              </div>
                           </SelectItem>
                           <SelectItem value="pie">
                              <div className="flex items-center space-x-2">
                                 <PieChartIcon className="h-4 w-4" />
                                 <span>Pie Chart</span>
                              </div>
                           </SelectItem>
                        </SelectContent>
                     </Select>
                  </div>

                  {/* X Axis */}
                  <div className="space-y-2">
                     <label className="text-sm font-medium">X-Axis (Categories)</label>
                     <Select value={xAxis} onValueChange={setXAxis}>
                        <SelectTrigger>
                           <SelectValue placeholder="Select X-axis" />
                        </SelectTrigger>
                        <SelectContent>
                           {headers.map((header) => (
                              <SelectItem key={header} value={header}>
                                 {header}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>

                  {/* Y Axis */}
                  <div className="space-y-2">
                     <label className="text-sm font-medium">Y-Axis (Values)</label>
                     <Select value={yAxis} onValueChange={setYAxis}>
                        <SelectTrigger>
                           <SelectValue placeholder="Select Y-axis" />
                        </SelectTrigger>
                        <SelectContent>
                           {numericColumns.length > 0 ? (
                              numericColumns.map((header) => (
                                 <SelectItem key={header} value={header}>
                                    {header}
                                 </SelectItem>
                              ))
                           ) : (
                              <SelectItem disabled value="">
                                 No numeric columns found
                              </SelectItem>
                           )}
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               {numericColumns.length === 0 && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                     <strong>Note:</strong> No numeric columns detected in your data.
                     The visualization might not work as expected. Please ensure your Excel file contains numeric data.
                  </div>
               )}
            </CardContent>
         </Card>

         {/* Chart Display */}
         <Card>
            <CardHeader>
               <CardTitle>
                  {xAxis && yAxis ? `${yAxis} by ${xAxis}` : 'Chart Preview'}
               </CardTitle>
               {chartData.length > 0 && (
                  <CardDescription>
                     Showing {chartData.length} data points
                  </CardDescription>
               )}
            </CardHeader>
            <CardContent>
               {renderChart()}
            </CardContent>
         </Card>

         {/* Chart Data Summary */}
         {chartData.length > 0 && (
            <Card>
               <CardHeader>
                  <CardTitle>Data Summary</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                     <div>
                        <span className="font-medium">Total Points:</span> {chartData.length}
                     </div>
                     <div>
                        <span className="font-medium">Max Value:</span> {Math.max(...chartData.map(d => d.value)).toLocaleString()}
                     </div>
                     <div>
                        <span className="font-medium">Min Value:</span> {Math.min(...chartData.map(d => d.value)).toLocaleString()}
                     </div>
                     <div>
                        <span className="font-medium">Avg Value:</span> {(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length).toLocaleString()}
                     </div>
                  </div>
               </CardContent>
            </Card>
         )}
      </div>
   )
}

export default ChartView
