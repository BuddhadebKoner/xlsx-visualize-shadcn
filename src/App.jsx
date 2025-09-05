import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import FileUpload from '@/components/FileUpload'
import TableView from '@/components/TableView'
import ChartView from '@/components/ChartView'

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<FileUpload />} />
          <Route path="/table" element={<TableView />} />
          <Route path="/visualize" element={<ChartView />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App