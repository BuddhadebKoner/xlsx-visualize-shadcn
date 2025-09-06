import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import RecentFiles from '@/components/RecentFiles'
import FileUpload from '@/components/FileUpload'
import TableView from '@/components/TableView'
import ChartView from '@/components/ChartView'
import AIAnalysis from '@/components/AIAnalysis'

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<RecentFiles />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/table" element={<TableView />} />
          <Route path="/visualize" element={<ChartView />} />
          <Route path="/ai-analysis" element={<AIAnalysis />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App