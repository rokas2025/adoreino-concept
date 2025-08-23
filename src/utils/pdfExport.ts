import { AdoreInoResults } from '../types'

export interface PDFExportOptions {
  title?: string
  includeTimestamp?: boolean
  includeTechnicalDetails?: boolean
  format?: 'business' | 'technical' | 'executive'
}

/**
 * Export analysis results to PDF format
 * Note: This is a simplified implementation using HTML to PDF conversion
 * For production, consider using jsPDF or puppeteer for better formatting
 */
export async function exportToPDF(
  results: AdoreInoResults, 
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    title = 'AdoreIno Code Analysis Report',
    includeTimestamp = true,
    includeTechnicalDetails = true,
    format = 'business'
  } = options

  // Create HTML content for PDF
  const htmlContent = generateHTMLReport(results, {
    title,
    includeTimestamp,
    includeTechnicalDetails,
    format
  })

  // Convert HTML to PDF using browser's print functionality
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups.')
  }

  printWindow.document.write(htmlContent)
  printWindow.document.close()
  
  // Wait for content to load
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 1000)
}

function generateHTMLReport(
  results: AdoreInoResults,
  options: PDFExportOptions
): string {
  const timestamp = new Date().toLocaleDateString()
  const { title, includeTimestamp, includeTechnicalDetails, format } = options

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .score-card {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .score {
            font-size: 48px;
            font-weight: bold;
            color: ${getScoreColor(results.systemOverview.overallScore)};
        }
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        .section {
            margin: 30px 0;
        }
        .section h2 {
            color: #007bff;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 10px;
        }
        .risk-item {
            background: #fff;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 15px;
            margin: 10px 0;
        }
        .risk-high { border-left: 4px solid #dc3545; }
        .risk-medium { border-left: 4px solid #ffc107; }
        .risk-low { border-left: 4px solid #28a745; }
        .tech-tag {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            margin: 2px;
            font-size: 12px;
        }
        .recommendation {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
        }
        @media print {
            body { margin: 0; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        ${includeTimestamp ? `<p>Generated on: ${timestamp}</p>` : ''}
        <p>Powered by AdoreIno AI Code Analysis</p>
    </div>

    <!-- Executive Summary -->
    <div class="section">
        <h2>Executive Summary</h2>
        <div class="score-card">
            <div class="score">${results.systemOverview.overallScore}/100</div>
            <h3>Overall Quality Score</h3>
            <p><strong>Quality Rating:</strong> ${results.systemOverview.qualityRating.toUpperCase()}</p>
            <p><strong>Project Type:</strong> ${results.systemOverview.projectType}</p>
            <p><strong>Risk Level:</strong> ${results.riskAssessment.overallRisk.toUpperCase()}</p>
        </div>
    </div>

    <!-- Technology Stack -->
    <div class="section">
        <h2>Technology Stack</h2>
        <p><strong>Main Technologies:</strong></p>
        <div>
            ${results.systemOverview.mainTechnologies.map(tech => 
                `<span class="tech-tag">${tech}</span>`
            ).join('')}
        </div>
        <div class="grid">
            <div>
                <p><strong>Modernity Score:</strong> ${results.systemOverview.modernityScore}/100</p>
                <p><strong>Competitiveness:</strong> ${results.systemOverview.competitivenessRating}</p>
            </div>
            <div>
                <p><strong>Complexity:</strong> ${results.systemOverview.estimatedComplexity}</p>
                <p><strong>Confidence Level:</strong> ${results.confidenceLevel}%</p>
            </div>
        </div>
    </div>

    ${format !== 'executive' ? `
    <!-- Business Recommendations -->
    <div class="section">
        <h2>Business Recommendations</h2>
        ${results.businessRecommendations.map(rec => `
            <div class="recommendation">
                <h3>${rec.title}</h3>
                <p><strong>Category:</strong> ${rec.category.toUpperCase()}</p>
                <p>${rec.description}</p>
                <div class="grid">
                    <div>
                        <p><strong>Cost Estimate:</strong> ${rec.costEstimate}</p>
                        <p><strong>Timeline:</strong> ${rec.timeline}</p>
                    </div>
                    <div>
                        <p><strong>Business Impact:</strong> ${rec.businessImpact}</p>
                        <p><strong>Priority:</strong> ${rec.priority}</p>
                    </div>
                </div>
            </div>
        `).join('')}
    </div>

    <!-- Risk Assessment -->
    <div class="section">
        <h2>Risk Assessment</h2>
        <p><strong>Overall Risk Level:</strong> ${results.riskAssessment.overallRisk.toUpperCase()}</p>
        ${results.riskAssessment.risks.map(risk => `
            <div class="risk-item risk-${risk.impact}">
                <h4>${risk.title}</h4>
                <p><strong>Impact:</strong> ${risk.impact.toUpperCase()} | <strong>Likelihood:</strong> ${risk.likelihood.toUpperCase()}</p>
                <p>${risk.description}</p>
                <p><strong>Affected Files:</strong> ${risk.affectedFiles.join(', ')}</p>
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${includeTechnicalDetails && format !== 'business' ? `
    <div class="page-break"></div>
    <!-- Technical Details -->
    <div class="section">
        <h2>Technical Analysis</h2>
        <div class="grid">
            <div>
                <p><strong>Total Files:</strong> ${results.technicalStructure.codeMetrics.totalFiles.toLocaleString()}</p>
                <p><strong>Lines of Code:</strong> ${results.technicalStructure.codeMetrics.totalLines.toLocaleString()}</p>
                <p><strong>Complexity Score:</strong> ${results.technicalStructure.codeMetrics.complexity}</p>
            </div>
            <div>
                <p><strong>Test Coverage:</strong> ${results.technicalStructure.codeMetrics.testCoverage ? `${results.technicalStructure.codeMetrics.testCoverage.toFixed(1)}%` : 'N/A'}</p>
                <p><strong>Technical Debt:</strong> ${results.technicalStructure.codeMetrics.technicalDebt.toFixed(1)}%</p>
                <p><strong>Architecture:</strong> ${results.technicalStructure.architecture.pattern}</p>
            </div>
        </div>
    </div>

    <!-- System Modules -->
    <div class="section">
        <h2>System Modules</h2>
        ${results.technicalStructure.modules.map(module => `
            <div class="risk-item">
                <h4>${module.name} (${module.type})</h4>
                <p>${module.description}</p>
                <p><strong>Lines of Code:</strong> ${module.linesOfCode.toLocaleString()}</p>
                <p><strong>Dependencies:</strong> ${module.dependencies.length}</p>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <!-- Maintenance Tasks -->
    <div class="section">
        <h2>Recommended Actions</h2>
        <p><strong>Priority Level:</strong> ${results.maintenanceNeeds.priorityLevel.toUpperCase()}</p>
        <p><strong>Estimated Effort:</strong> ${results.maintenanceNeeds.estimatedEffort}</p>
        
        ${results.maintenanceNeeds.urgentTasks.length > 0 ? `
            <h3>Urgent Tasks</h3>
            ${results.maintenanceNeeds.urgentTasks.map(task => `
                <div class="risk-item risk-high">
                    <h4>${task.title}</h4>
                    <p>${task.description}</p>
                    <p><strong>Estimated Hours:</strong> ${task.estimatedHours}</p>
                    <p><strong>Files:</strong> ${task.files.join(', ')}</p>
                </div>
            `).join('')}
        ` : ''}

        ${results.maintenanceNeeds.recommendedTasks.length > 0 ? `
            <h3>Recommended Tasks</h3>
            ${results.maintenanceNeeds.recommendedTasks.map(task => `
                <div class="risk-item risk-medium">
                    <h4>${task.title}</h4>
                    <p>${task.description}</p>
                    <p><strong>Estimated Hours:</strong> ${task.estimatedHours}</p>
                    <p><strong>Files:</strong> ${task.files.join(', ')}</p>
                </div>
            `).join('')}
        ` : ''}
    </div>

    <div class="section">
        <p style="text-align: center; color: #666; font-size: 12px;">
            This report was generated by AdoreIno AI Code Analysis Platform<br>
            For more information, visit: adorino.com
        </p>
    </div>
</body>
</html>
  `
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#28a745' // Green
  if (score >= 60) return '#ffc107' // Yellow
  return '#dc3545' // Red
}

/**
 * Generate a simplified business-focused PDF report
 */
export async function exportBusinessReport(results: AdoreInoResults): Promise<void> {
  return exportToPDF(results, {
    title: 'Business Impact Analysis Report',
    format: 'business',
    includeTechnicalDetails: false
  })
}

/**
 * Generate a comprehensive technical PDF report
 */
export async function exportTechnicalReport(results: AdoreInoResults): Promise<void> {
  return exportToPDF(results, {
    title: 'Technical Analysis Report',
    format: 'technical',
    includeTechnicalDetails: true
  })
}

/**
 * Generate an executive summary PDF report
 */
export async function exportExecutiveReport(results: AdoreInoResults): Promise<void> {
  return exportToPDF(results, {
    title: 'Executive Summary Report',
    format: 'executive',
    includeTechnicalDetails: false
  })
}