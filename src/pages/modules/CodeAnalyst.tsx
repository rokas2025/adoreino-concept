import React, { useState, useCallback } from 'react'
import { CodeBracketIcon, DocumentArrowUpIcon, ChartBarIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'
import JSZip from 'jszip'
import toast from 'react-hot-toast'
import { AdoreInoAnalyzer } from '../../utils/adoreIno'
import { createAIService } from '../../services/aiService'
import { AdoreInoAnalysis, AdoreInoResults } from '../../types'
import { AdoreInoReport } from '../../components/AdoreInoReport'
import { AIProviderStatus } from '../../components/AIProviderStatus'
import { scanURL, convertURLScanToFileStructure } from '../../utils/urlScanner'

export function CodeAnalyst() {
  const [selectedProject, setSelectedProject] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<{ path: string; content: string; size: number }[]>([])
  const [analysis, setAnalysis] = useState<AdoreInoAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState<string>('')
  const [userProfile, setUserProfile] = useState<'github' | 'zip' | 'url'>('zip')
  const [aiProviderUsed, setAiProviderUsed] = useState<{ provider: string; model: string } | null>(null)
  const [urlInput, setUrlInput] = useState<string>('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const files: { path: string; content: string; size: number }[] = []
    
    for (const file of acceptedFiles) {
      if (file.name.endsWith('.zip')) {
        const zip = new JSZip()
        const zipContent = await zip.loadAsync(file)
        
        for (const [path, zipEntry] of Object.entries(zipContent.files)) {
          if (!zipEntry.dir && shouldIncludeFile(path)) {
            const content = await zipEntry.async('string')
            files.push({ path, content, size: content.length })
          }
        }
      } else if (shouldIncludeFile(file.name)) {
        const content = await file.text()
        files.push({ path: file.name, content, size: file.size })
      }
    }
    
    setUploadedFiles(files)
    
    // Show success toast for file upload
    if (files.length > 0) {
      toast.success(`Successfully uploaded ${files.length} files! 📁`, {
        duration: 3000,
        position: 'top-right',
      })
    }
  }, [])

  const shouldIncludeFile = (path: string): boolean => {
    const excludePatterns = [
      'node_modules/',
      '.git/',
      'dist/',
      'build/',
      '.DS_Store',
      '.env'
    ]
    
    const includeExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.php', '.html', '.css', '.scss', '.json', '.md'
    ]
    
    return !excludePatterns.some(pattern => path.includes(pattern)) &&
           includeExtensions.some(ext => path.endsWith(ext))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'text/*': ['.js', '.jsx', '.ts', '.tsx', '.php', '.html', '.css', '.json', '.md']
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0 && !selectedProject && !urlInput) {
      alert('Please upload files, select a project, or enter a URL first')
      return
    }

    setIsAnalyzing(true)
    setAnalysisStep('Initializing analysis...')
    
    try {
      // Create analysis record
      const analysisId = `analysis-${Date.now()}`
      const newAnalysis: AdoreInoAnalysis = {
        id: analysisId,
        projectId: selectedProject || 'uploaded-project',
        status: 'analyzing',
        createdAt: new Date().toISOString()
      }
      setAnalysis(newAnalysis)

      // Step 1: Code Structure Analysis
      setAnalysisStep('Mapping code structure and dependencies...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Use uploaded files, URL scan results, or create demo files if project selected
      let filesToAnalyze = uploadedFiles
      
      // Handle URL scanning
      if (userProfile === 'url' && urlInput && uploadedFiles.length === 0) {
        setAnalysisStep('Scanning website URL...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        try {
          const scanResult = await scanURL(urlInput, {
            includeResources: true,
            checkPerformance: true,
            analyzeSEO: true,
            checkAccessibility: true
          })
          
          filesToAnalyze = convertURLScanToFileStructure(scanResult)
          
          toast.success(`Successfully scanned ${urlInput}! 🌐`, {
            duration: 3000,
            position: 'top-right',
          })
        } catch (error) {
          toast.error(`Failed to scan URL: ${error instanceof Error ? error.message : 'Unknown error'}`, {
            duration: 5000,
            position: 'top-right',
          })
          throw error
        }
      } else if (uploadedFiles.length === 0 && selectedProject) {
        // Create realistic demo files based on selected project
        const demoFiles = {
          portfolio: [
            { path: 'src/components/Header.tsx', content: 'import React from "react"\nimport { Link } from "react-router-dom"\n\nexport default function Header() {\n  return (\n    <header className="bg-white shadow">\n      <nav className="container mx-auto px-4">\n        <Link to="/" className="text-2xl font-bold">Portfolio</Link>\n      </nav>\n    </header>\n  )\n}', size: 320 },
            { path: 'src/pages/About.tsx', content: 'import React from "react"\n\nexport default function About() {\n  return (\n    <div className="container mx-auto px-4 py-8">\n      <h1>About Me</h1>\n      <p>I am a web developer...</p>\n    </div>\n  )\n}', size: 180 },
            { path: 'src/pages/Projects.tsx', content: 'import React, { useState, useEffect } from "react"\n\ninterface Project {\n  id: number\n  title: string\n  description: string\n}\n\nexport default function Projects() {\n  const [projects, setProjects] = useState<Project[]>([])\n  \n  useEffect(() => {\n    // Fetch projects\n  }, [])\n  \n  return <div>Projects</div>\n}', size: 380 },
            { path: 'package.json', content: '{\n  "name": "portfolio-website",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-router-dom": "^6.8.0",\n    "tailwindcss": "^3.2.0"\n  }\n}', size: 180 }
          ],
          ecommerce: [
            { path: 'src/components/ProductCard.tsx', content: 'import React from "react"\n\ninterface Product {\n  id: number\n  name: string\n  price: number\n  image: string\n}\n\ninterface Props {\n  product: Product\n}\n\nexport default function ProductCard({ product }: Props) {\n  return (\n    <div className="border rounded-lg p-4">\n      <img src={product.image} alt={product.name} />\n      <h3>{product.name}</h3>\n      <p>${product.price}</p>\n    </div>\n  )\n}', size: 420 },
            { path: 'src/pages/Cart.tsx', content: 'import React, { useState } from "react"\nimport { useCart } from "../hooks/useCart"\n\nexport default function Cart() {\n  const { items, removeItem, updateQuantity } = useCart()\n  const [loading, setLoading] = useState(false)\n  \n  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)\n  \n  return (\n    <div>\n      <h1>Shopping Cart</h1>\n      {/* Cart implementation */}\n    </div>\n  )\n}', size: 480 },
            { path: 'src/services/api.ts', content: 'import axios from "axios"\n\nconst api = axios.create({\n  baseURL: process.env.REACT_APP_API_URL\n})\n\nexport const productAPI = {\n  getProducts: () => api.get("/products"),\n  getProduct: (id: number) => api.get(`/products/${id}`)\n}\n\nexport const orderAPI = {\n  createOrder: (data: any) => api.post("/orders", data)\n}', size: 340 },
            { path: 'package.json', content: '{\n  "name": "ecommerce-store",\n  "version": "2.1.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "axios": "^1.3.0",\n    "stripe": "^11.0.0",\n    "@reduxjs/toolkit": "^1.9.0"\n  }\n}', size: 220 }
          ],
          blog: [
            { path: 'src/components/BlogPost.tsx', content: 'import React from "react"\nimport { formatDate } from "../utils/date"\n\ninterface Post {\n  id: number\n  title: string\n  content: string\n  author: string\n  createdAt: string\n}\n\ninterface Props {\n  post: Post\n}\n\nexport default function BlogPost({ post }: Props) {\n  return (\n    <article className="prose max-w-none">\n      <h1>{post.title}</h1>\n      <p className="text-gray-600">By {post.author} on {formatDate(post.createdAt)}</p>\n      <div dangerouslySetInnerHTML={{ __html: post.content }} />\n    </article>\n  )\n}', size: 560 },
            { path: 'src/pages/BlogList.tsx', content: 'import React, { useState, useEffect } from "react"\nimport { BlogPost } from "../types"\nimport { blogAPI } from "../services/api"\n\nexport default function BlogList() {\n  const [posts, setPosts] = useState<BlogPost[]>([])\n  const [loading, setLoading] = useState(true)\n  \n  useEffect(() => {\n    loadPosts()\n  }, [])\n  \n  const loadPosts = async () => {\n    try {\n      const response = await blogAPI.getPosts()\n      setPosts(response.data)\n    } catch (error) {\n      console.error("Failed to load posts")\n    } finally {\n      setLoading(false)\n    }\n  }\n  \n  return <div>Blog posts...</div>\n}', size: 680 },
            { path: 'src/utils/date.ts', content: 'export function formatDate(dateString: string): string {\n  const date = new Date(dateString)\n  return date.toLocaleDateString("en-US", {\n    year: "numeric",\n    month: "long", \n    day: "numeric"\n  })\n}\n\nexport function timeAgo(dateString: string): string {\n  const now = new Date()\n  const date = new Date(dateString)\n  const diff = now.getTime() - date.getTime()\n  \n  const days = Math.floor(diff / (1000 * 60 * 60 * 24))\n  if (days > 0) return `${days} days ago`\n  \n  const hours = Math.floor(diff / (1000 * 60 * 60))\n  return `${hours} hours ago`\n}', size: 520 },
            { path: 'package.json', content: '{\n  "name": "company-blog",\n  "version": "1.5.2",\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-router-dom": "^6.8.0",\n    "markdown-to-jsx": "^7.2.0",\n    "date-fns": "^2.29.0"\n  },\n  "devDependencies": {\n    "@types/react": "^18.0.0",\n    "typescript": "^4.9.0"\n  }\n}', size: 340 }
          ]
        }
        
        filesToAnalyze = demoFiles[selectedProject as keyof typeof demoFiles] || demoFiles.portfolio
      }
      
      const analyzer = new AdoreInoAnalyzer(filesToAnalyze)
      
      // Step 2: Code Quality Analysis
      setAnalysisStep('Analyzing code quality and potential improvements...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const baseResults = await analyzer.analyze()
      
      // Step 3: AI Code Suggestions
      setAnalysisStep('Generating AI-powered improvement suggestions...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Configure AI service based on user preference and available API keys
      const aiService = createAIService({
        // Will automatically detect available API keys and use the best provider
        maxTokens: 2000,
        temperature: 0.7
      })
      
      // Store which AI provider was used for this analysis
      setAiProviderUsed({
        provider: (aiService as any).config.provider,
        model: (aiService as any).config.model
      })
      
      const enhancedResults = await aiService.enhanceAnalysisWithAI(baseResults, userProfile)
      
      // Complete analysis
      const completedAnalysis: AdoreInoAnalysis = {
        ...newAnalysis,
        status: 'completed',
        completedAt: new Date().toISOString(),
        results: enhancedResults
      }
      
      setAnalysis(completedAnalysis)
      
      // Show success message
      toast.success('Analysis completed successfully! 🎉', {
        duration: 4000,
        position: 'top-right',
      })
      
    } catch (error) {
      console.error('Analysis failed:', error)
      console.error('Error details:', error)
      
      // Show error toast
      toast.error('Analysis failed. Please check the error details below.', {
        duration: 5000,
        position: 'top-right',
      })
      
      // Set analysis as failed with error details
      setAnalysis(prev => prev ? { 
        ...prev, 
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      } : null)
    } finally {
      setIsAnalyzing(false)
      setAnalysisStep('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <CodeBracketIcon className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Code Analyst</h1>
          <p className="text-gray-600">Analyze website source code, get AI-powered improvement suggestions, and deploy changes</p>
        </div>
      </div>

      {/* AI Provider Status */}
      <AIProviderStatus />

      {/* Input Method Selection */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Input Method</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'github', label: 'GitHub Repository', desc: 'Connect via OAuth and analyze repository' },
            { value: 'zip', label: 'ZIP Upload', desc: 'Upload website files as ZIP archive' },
            { value: 'url', label: 'Website URL', desc: 'Scan and analyze live website' }
          ].map(method => (
            <button
              key={method.value}
              className={`p-4 border rounded-lg text-left transition-colors ${
                userProfile === method.value
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setUserProfile(method.value as any)}
            >
              <div className="font-medium">{method.label}</div>
              <div className="text-sm text-gray-600 mt-1">{method.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* GitHub Repository Selection */}
      {userProfile === 'github' && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select GitHub Repository</h3>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                🔗 GitHub integration requires OAuth setup. For demo purposes, use ZIP upload instead.
              </p>
            </div>
            <select 
              className="input"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Connect GitHub first...</option>
              <option value="portfolio">my-portfolio-site (demo)</option>
              <option value="ecommerce">ecommerce-website (demo)</option>
              <option value="blog">company-blog (demo)</option>
            </select>
          </div>
        </div>
      )}

      {/* ZIP File Upload */}
      {userProfile === 'zip' && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Website Files (ZIP)</h3>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop files here...</p>
            ) : (
              <>
                <p className="text-gray-600 mb-2">
                  Drag & drop project files or ZIP archive, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports: JS, TS, PHP, HTML, CSS, JSON, MD files up to 50MB
                </p>
              </>
            )}
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircleIcon className="h-4 w-4" />
                <span>{uploadedFiles.length} files uploaded</span>
              </div>
              <div className="mt-2 max-h-32 overflow-y-auto">
                <div className="text-xs text-gray-500 grid grid-cols-3 gap-1">
                  {uploadedFiles.slice(0, 12).map((file, index) => (
                    <div key={index} className="truncate">{file.path}</div>
                  ))}
                  {uploadedFiles.length > 12 && (
                    <div className="text-gray-400">...and {uploadedFiles.length - 12} more</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL Scanning */}
      {userProfile === 'url' && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Scan Website URL</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                🌐 Enter your website URL to scan and analyze the live site structure and content.
              </p>
            </div>
            <input
              type="url"
              className="input"
              placeholder="https://example.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Analysis Button */}
      {userProfile && (
        <div className="card p-6">
          <button 
            className="btn-primary w-full"
            onClick={handleAnalyze}
            disabled={
              (!selectedProject && uploadedFiles.length === 0 && !urlInput) || 
              isAnalyzing ||
              (userProfile === 'github' && !selectedProject) ||
              (userProfile === 'url' && !urlInput) ||
              (userProfile === 'zip' && uploadedFiles.length === 0)
            }
          >
            {isAnalyzing ? 'Analyzing Code...' : 'Start AI Code Analysis'}
          </button>
          <p className="text-sm text-gray-500 mt-2 text-center">
            AI will analyze your code structure, suggest improvements, and generate documentation
          </p>
        </div>
      )}

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="font-medium">Running AI Code Analysis...</span>
          </div>
          {analysisStep && (
            <div className="text-sm text-gray-600 bg-gray-50 rounded p-3">
              {analysisStep}
            </div>
          )}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ 
                width: analysisStep.includes('Initializing') ? '10%' :
                       analysisStep.includes('Mapping') ? '40%' :
                       analysisStep.includes('quality') ? '70%' :
                       analysisStep.includes('AI-powered') ? '90%' : '0%'
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis?.results && (
        <AdoreInoReport 
          results={analysis.results} 
          userProfile={userProfile}
          aiProvider={aiProviderUsed?.provider}
          aiModel={aiProviderUsed?.model}
        />
      )}

      {analysis?.status === 'failed' && (
        <div className="card p-6 border-red-200 bg-red-50">
          <div className="flex items-center space-x-3 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-medium text-red-900">Analysis Failed</h3>
              <p className="text-red-700 text-sm">
                We encountered an error during analysis. Please check the details below and try again.
              </p>
            </div>
          </div>
          
          {(analysis as any).error && (
            <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
              <p className="text-xs text-red-800 font-mono">
                Error: {(analysis as any).error}
              </p>
            </div>
          )}
          
        </div>
      )}
    </div>
  )
} 