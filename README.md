# Excel/CSV File Visualizer with AI Analysis

A modern web application for uploading, viewing, and analyzing Excel (XLSX/XLS) and CSV files with AI-powered insights. Built with React, Vite, Shadcn/UI components, and Google Gemini AI, this tool provides an intuitive interface for comprehensive data analysis and visualization.

🌐 **Live Demo**: [https://xlsx-visualize-shadcn.vercel.app](https://xlsx-visualize-shadcn.vercel.app)

## ✨ Features

### 🤖 AI-Powered Analysis (New!)
- **Google Gemini AI Integration**: Ask natural language questions about your data
- **Intelligent Insights**: Get concise, under-100-word responses about patterns and trends
- **Smart Data Processing**: AI analyzes data structure and provides relevant suggestions
- **Data Limitations**: Optimized for datasets up to 1,000 rows and 10 columns
- **Best Visualization Recommendations**: AI suggests optimal chart types for your data

### 📤 Enhanced File Upload
- **Drag & Drop Support**: Simply drag and drop your Excel or CSV files
- **File Format Support**: XLSX, XLS, and CSV files with validation
- **Smart Upload Flow**: Choose your next action after successful upload
- **Quick Action Buttons**: Direct access to Table View, Charts, or AI Analysis
- **Real-time Feedback**: Upload status with success/error messages and progress indicators

### 📊 Advanced Data Visualization
- **Multiple Chart Types**: 
  - Bar Charts for categorical data comparison
  - Line Charts for trend analysis
  - Pie Charts for proportion visualization
- **Interactive Charts**: Built with Recharts for responsive and interactive visualizations
- **Dynamic Axis Selection**: Choose X and Y axes from your data columns
- **Automatic Data Type Detection**: Smart detection of numeric vs categorical columns
- **AI Chart Suggestions**: Get AI recommendations for the best visualization methods

### 📋 Enhanced Table View
- **Tabular Data Display**: Clean, organized table view of your spreadsheet data
- **Advanced Search**: Real-time search across all data fields
- **Smart Pagination**: Efficient pagination for large datasets (50 rows per page)
- **Responsive Design**: Mobile-friendly table layout
- **Quick AI Access**: Ask AI questions directly from the table view

### 📁 File Management
- **Recent Files**: Quick access to recently uploaded files
- **File History**: Track and revisit previously uploaded files
- **File Metadata**: Display file information and upload timestamps
- **Server Integration**: Files saved to backend for persistence

## 🛠 Tech Stack

- **Frontend**: React 19.1.1 with Vite
- **UI Components**: Shadcn/UI with Radix UI primitives
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini AI (gemini-1.5-flash model)
- **Charts**: Recharts for data visualization
- **File Processing**: SheetJS (xlsx) for Excel file parsing
- **State Management**: Zustand for global state
- **Backend**: Express.js server for file uploads
- **Icons**: Lucide React
- **HTTP Client**: Native Fetch API

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key (free tier available)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BuddhadebKoner/xlsx-visualize-shadcn.git
cd xlsx-visualize-shadcn
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API keys
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SERVER_URL=http://localhost:3001
```

4. Start the development server:
```bash
npm run dev:full
```
This command starts both the frontend (port 5173) and backend server (port 3001) concurrently.

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run server` - Start backend server only
- `npm run dev:full` - Start both frontend and backend servers
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── AIAnalysis.jsx     # AI-powered data analysis
│   │   ├── ChartView.jsx      # Data visualization component
│   │   ├── FileUpload.jsx     # Enhanced file upload interface
│   │   ├── TableView.jsx      # Tabular data display
│   │   ├── RecentFiles.jsx    # File history management
│   │   ├── Layout.jsx         # Main layout with navigation
│   │   └── ui/                # Shadcn/UI components
│   ├── store/
│   │   └── useExcelStore.js   # Zustand state management
│   ├── lib/
│   │   ├── geminiService.js   # Google Gemini AI integration
│   │   └── utils.js           # Utility functions
│   └── assets/                # Static assets
├── server/
│   ├── server.js              # Express server with file handling
│   └── uploads/               # File upload directory
├── .env                       # Environment variables (not in repo)
├── .env.example              # Environment template
└── public/                    # Static assets
```

## 🎯 Usage

### 1. Upload a File
- Navigate to the upload page
- Review AI analysis requirements (max 1,000 rows, 10 columns)
- Drag & drop or select an Excel/CSV file
- Choose your next action: **Start Data Analysis**, Create Charts, or AI Analysis

### 2. Explore Your Data
- **Table View**: Browse data with search and pagination
- **Chart View**: Create interactive visualizations
- **AI Analysis**: Ask questions like:
  - "What patterns do you see?"
  - "Any key insights?"
  - "Best visualization for this data?"
  - "Summarize main trends"
  - "Data quality issues?"

### 3. AI Analysis Guidelines
- **Dataset Limits**: Maximum 1,000 rows and 10 columns
- **Data Quality**: Clean data with clear column headers
- **Format**: Structured data (no merged cells or complex formatting)
- **Response Length**: Concise insights under 100 words
- **Sample Analysis**: AI analyzes first 15 rows for quick insights

### 4. Data Requirements for Best Results
- ✅ Clean, structured data
- ✅ Clear column headers
- ✅ Consistent data types
- ✅ No merged cells
- ✅ Numeric data in proper format
- ❌ Avoid overly complex spreadsheets
- ❌ Avoid datasets larger than 1,000 rows for AI analysis

## 🚀 Deployment

### Environment Setup
For production deployment, set these environment variables:
- `VITE_GEMINI_API_KEY`: Your Google Gemini API key
- `VITE_SERVER_URL`: Your backend server URL

### Vercel Deployment (Recommended)
1. Build the project: `npm run build`
2. Deploy to Vercel with environment variables configured
3. Deploy the backend server separately (Railway, Render, etc.)

### Local Production Build
```bash
npm run build
npm run preview
```

## 🔐 Security Features

- ✅ API keys stored in environment variables
- ✅ No hardcoded secrets in source code
- ✅ .env file properly gitignored
- ✅ Client-side API key validation
- ✅ Error handling for API failures

## 🤖 AI Analysis Features

### Supported Questions
- Data patterns and trends
- Key insights and summaries
- Visualization recommendations
- Data quality assessment
- Statistical observations

### Limitations
- Maximum 1,000 rows per dataset
- Maximum 10 columns analyzed
- Responses limited to 100 words
- Analyzes first 15 rows for speed
- Free tier API quota limits

## 🛠 Available Scripts

- `npm run dev` - Start frontend development server
- `npm run server` - Start backend server only
- `npm run dev:full` - Start both frontend and backend servers
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add your Gemini API key to `.env`
5. Test thoroughly
6. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Troubleshooting

### Common Issues
- **API Key Invalid**: Check your Gemini API key in `.env`
- **Server Connection Failed**: Ensure backend server is running on port 3001
- **File Upload Failed**: Check file format and size limits
- **AI Analysis Not Working**: Verify dataset meets size requirements

### Getting Help
- Check the console for error messages
- Ensure all environment variables are set
- Verify your Gemini API key has sufficient quota
- Review dataset requirements for AI analysis
