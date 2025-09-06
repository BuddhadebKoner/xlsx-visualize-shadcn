import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Brain, Send, Loader2, AlertCircle, Lightbulb } from 'lucide-react'
import useExcelStore from '@/store/useExcelStore'
import geminiService from '@/lib/geminiService'

const AIAnalysis = () => {
   const [question, setQuestion] = useState('')
   const [isLoading, setIsLoading] = useState(false)
   const [response, setResponse] = useState('')
   const [error, setError] = useState('')
   const [insights, setInsights] = useState('')

   const { data, headers, fileName, isDataLoaded } = useExcelStore()

   const handleAnalyze = async () => {
      if (!question.trim()) {
         setError('Please enter a question about your data')
         return
      }

      setIsLoading(true)
      setError('')
      setResponse('')

      try {
         const result = await geminiService.analyzeData(data, headers, question)
         setResponse(result)
      } catch (err) {
         setError(err.message)
      } finally {
         setIsLoading(false)
      }
   }

   const getDataInsights = async () => {
      setInsights('Loading insights...')
      try {
         const result = await geminiService.getDataInsights(data, headers)
         setInsights(result)
      } catch (err) {
         setInsights('Failed to load insights')
      }
   }

   React.useEffect(() => {
      if (isDataLoaded && data.length > 0) {
         getDataInsights()
      }
   }, [isDataLoaded, data])

   const suggestedQuestions = [
      "What patterns do you see?",
      "Any key insights?",
      "Best visualization for this data?",
      "Summarize main trends",
      "Data quality issues?"
   ]

   const handleSuggestedQuestion = (suggestedQuestion) => {
      setQuestion(suggestedQuestion)
   }

   const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault()
         handleAnalyze()
      }
   }

   if (!isDataLoaded) {
      return (
         <div className="text-center py-12">
            <Card className="max-w-md mx-auto">
               <CardContent className="pt-6">
                  <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Data for Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                     Please upload an Excel file first to start AI analysis
                  </p>
               </CardContent>
            </Card>
         </div>
      )
   }

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <div>
               <h1 className="text-3xl font-bold tracking-tight">AI Data Analysis</h1>
               <p className="text-muted-foreground">
                  Ask questions about your data and get AI-powered insights
               </p>
            </div>
         </div>

         {/* File Info */}
         {fileName && (
            <Card>
               <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     <span>📄 Analyzing: <strong>{fileName}</strong></span>
                     <span>•</span>
                     <span>{data.length} rows</span>
                     <span>•</span>
                     <span>{headers.length} columns</span>
                  </div>
               </CardContent>
            </Card>
         )}

         {/* Data Insights */}
         {insights && (
            <Card>
               <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                     <Lightbulb className="h-5 w-5" />
                     Dataset Overview & Limits
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                     {insights}
                  </pre>
               </CardContent>
            </Card>
         )}

         {/* Question Input */}
         <Card>
            <CardHeader>
               <CardTitle>Ask AI About Your Data</CardTitle>
               <CardDescription>
                  Get concise insights (under 100 words) about your data patterns and trends
               </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex gap-2">
                  <Input
                     placeholder="e.g., What are the main trends in this data?"
                     value={question}
                     onChange={(e) => setQuestion(e.target.value)}
                     onKeyPress={handleKeyPress}
                     disabled={isLoading}
                     className="flex-1"
                  />
                  <Button onClick={handleAnalyze} disabled={isLoading || !question.trim()}>
                     {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                     ) : (
                        <Send className="h-4 w-4" />
                     )}
                  </Button>
               </div>

               {/* Suggested Questions */}
               <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Suggested questions:</p>
                  <div className="flex flex-wrap gap-2">
                     {suggestedQuestions.map((suggestion, index) => (
                        <Button
                           key={index}
                           variant="outline"
                           size="sm"
                           onClick={() => handleSuggestedQuestion(suggestion)}
                           disabled={isLoading}
                           className="text-xs"
                        >
                           {suggestion}
                        </Button>
                     ))}
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Error Display */}
         {error && (
            <Card className="border-red-200 bg-red-50">
               <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-red-600">
                     <AlertCircle className="h-4 w-4" />
                     <span className="text-sm">{error}</span>
                  </div>
               </CardContent>
            </Card>
         )}

         {/* Response Display */}
         {response && (
            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <Brain className="h-5 w-5 text-blue-600" />
                     AI Analysis Result
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="prose prose-sm max-w-none">
                     <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                        {response}
                     </pre>
                  </div>
               </CardContent>
            </Card>
         )}

         {/* Disclaimer */}
         <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
               <p className="text-xs text-blue-600">
                  <strong>Limits:</strong> AI analyzes first 15 rows and max 10 columns. Dataset limit: 1000 rows.
                  Responses are kept under 100 words for quick insights.
               </p>
            </CardContent>
         </Card>
      </div>
   )
}

export default AIAnalysis
