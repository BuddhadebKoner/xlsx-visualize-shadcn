import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FileSpreadsheet, Table, BarChart3, Home, Upload, Brain } from 'lucide-react'

const Layout = ({ children }) => {
   const location = useLocation()

   const isActive = (path) => location.pathname === path

   return (
      <div className="min-h-screen bg-background">
         {/* Navigation Header */}
         <nav className="border-b bg-card">
            <div className="container mx-auto px-4 py-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                     <FileSpreadsheet className="h-6 w-6" />
                     <h1 className="text-xl font-bold">Excel Visualizer</h1>
                  </div>

                  <div className="flex space-x-2">
                     <Link to="/">
                        <Button
                           variant={isActive('/') ? 'default' : 'ghost'}
                           className="flex items-center space-x-2"
                        >
                           <Home className="h-4 w-4" />
                           <span>Home</span>
                        </Button>
                     </Link>

                     <Link to="/upload">
                        <Button
                           variant={isActive('/upload') ? 'default' : 'ghost'}
                           className="flex items-center space-x-2"
                        >
                           <Upload className="h-4 w-4" />
                           <span>Upload</span>
                        </Button>
                     </Link>

                     <Link to="/table">
                        <Button
                           variant={isActive('/table') ? 'default' : 'ghost'}
                           className="flex items-center space-x-2"
                        >
                           <Table className="h-4 w-4" />
                           <span>Table</span>
                        </Button>
                     </Link>

                     <Link to="/visualize">
                        <Button
                           variant={isActive('/visualize') ? 'default' : 'ghost'}
                           className="flex items-center space-x-2"
                        >
                           <BarChart3 className="h-4 w-4" />
                           <span>Visualize</span>
                        </Button>
                     </Link>

                     <Link to="/ai-analysis">
                        <Button
                           variant={isActive('/ai-analysis') ? 'default' : 'ghost'}
                           className="flex items-center space-x-2"
                        >
                           <Brain className="h-4 w-4" />
                           <span>AI Analysis</span>
                        </Button>
                     </Link>
                  </div>
               </div>
            </div>
         </nav>

         {/* Main Content */}
         <main className="container mx-auto px-4 py-8">
            {children}
         </main>
      </div>
   )
}

export default Layout
