// URL Analysis Route - Complete implementation with database and queue
import express from 'express'
import { body, validationResult } from 'express-validator'
import { v4 as uuidv4 } from 'uuid'
import { DatabaseService } from '../services/DatabaseService.js'
import { queueService } from '../services/QueueService.js'
import { logger } from '../utils/logger.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

/**
 * POST /api/url-analysis/analyze
 * Analyze a website URL with real content extraction
 */
router.post('/analyze', [
  body('url')
    .isURL({ require_protocol: true })
    .withMessage('Valid URL with protocol (http/https) is required'),
  body('options.includeScreenshots')
    .optional()
    .isBoolean()
    .withMessage('includeScreenshots must be boolean'),
  body('options.deepAnalysis')
    .optional()
    .isBoolean()
    .withMessage('deepAnalysis must be boolean'),
  body('options.aiProfile')
    .optional()
    .isIn(['technical', 'business', 'mixed'])
    .withMessage('aiProfile must be technical, business, or mixed')
], async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { url, options = {} } = req.body
    const userId = req.user.id
    const analysisId = uuidv4()

    // Default options
    const analysisOptions = {
      includeScreenshots: options.includeScreenshots || false,
      deepAnalysis: options.deepAnalysis || true,
      aiProfile: options.aiProfile || 'mixed',
      includeLighthouse: true,
      includeAccessibility: true,
      includeSecurity: true,
      includePerformance: true,
      includeSEO: true,
      ...options
    }

    logger.info(`🌐 Starting real URL analysis for ${url}`, {
      analysisId,
      userId,
      options: analysisOptions
    })

    // Create initial analysis record in database
    await DatabaseService.createUrlAnalysis({
      id: analysisId,
      userId,
      url,
      status: 'pending',
      progress: 0,
      options: analysisOptions
    })

    // Queue the analysis job for background processing
    await queueService.addUrlAnalysisJob({
      analysisId,
      userId,
      url,
      options: analysisOptions
    })

    // Return immediate response with analysis ID
    res.json({
      success: true,
      analysisId,
      status: 'queued',
      message: 'Real website analysis queued! This will use Lighthouse, Pa11y, and technology detection.',
      estimatedTime: '30-60 seconds'
    })

  } catch (error) {
    logger.error('URL analysis request failed:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to start URL analysis',
      message: error.message
    })
  }
})

/**
 * GET /api/url-analysis/status/:analysisId
 * Check the status of a URL analysis
 */
router.get('/status/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params
    const userId = req.user.id

    const analysis = await DatabaseService.getUrlAnalysis(analysisId, userId)
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      })
    }

    res.json({
      success: true,
      analysis: {
        id: analysis.id,
        url: analysis.url,
        status: analysis.status,
        progress: analysis.progress || 0,
        startedAt: analysis.created_at,
        completedAt: analysis.completed_at,
        error: analysis.error_message
      }
    })

  } catch (error) {
    logger.error('Failed to get analysis status:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get analysis status'
    })
  }
})

/**
 * GET /api/url-analysis/result/:analysisId
 * Get the complete analysis results
 */
router.get('/result/:analysisId', authMiddleware, async (req, res) => {
  try {
    const { analysisId } = req.params
    const userId = req.user.id

    const analysis = await DatabaseService.getUrlAnalysisWithResults(analysisId, userId)
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      })
    }

    if (analysis.status !== 'completed') {
      return res.status(202).json({
        success: false,
        error: 'Analysis not completed yet',
        status: analysis.status,
        progress: analysis.progress || 0
      })
    }

    // Log for debugging
    logger.info(`📊 Returning analysis result for ${analysisId}`, {
      analysisId,
      hasComprehensiveSEO: !!(analysis.seo_analysis?.comprehensive?.overallScore),
      comprehensiveScore: analysis.seo_analysis?.comprehensive?.overallScore,
      seoKeys: Object.keys(analysis.seo_analysis || {}),
      userId
    })

    // Return comprehensive results
    res.json({
      success: true,
      analysis: {
        id: analysis.id,
        url: analysis.url,
        title: analysis.title,
        status: analysis.status,
        
        // Website data
        technologies: analysis.technologies,
        basic: analysis.basic_website_data,
        performance: analysis.performance_metrics,
        seo: analysis.seo_analysis,
        accessibility: analysis.accessibility_analysis,
        security: analysis.security_analysis,
        lighthouse: analysis.performance_metrics,
        
        // AI insights
        aiInsights: analysis.ai_insights,
        businessRecommendations: analysis.business_recommendations,
        technicalRecommendations: analysis.technical_recommendations,
        riskAssessment: analysis.risk_assessment,
        
        // Metadata
        analysisDate: analysis.created_at,
        completedAt: analysis.completed_at,
        duration: analysis.analysis_duration_ms,
        confidenceScore: analysis.confidence_score
      }
    })

  } catch (error) {
    logger.error('Failed to get analysis result:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get analysis result'
    })
  }
})

/**
 * GET /api/url-analysis/history
 * Get user's URL analysis history
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20

    const { analyses, total } = await DatabaseService.getUserUrlAnalyses(userId, {
      page,
      limit,
      orderBy: 'created_at',
      order: 'DESC'
    })

    res.json({
      success: true,
      analyses: analyses.map(analysis => ({
        id: analysis.id,
        url: analysis.url,
        title: analysis.title,
        status: analysis.status,
        createdAt: analysis.created_at,
        completedAt: analysis.completed_at,
        technologies: analysis.technologies,
        confidenceScore: analysis.confidence_score
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    logger.error('Failed to get analysis history:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get analysis history'
    })
  }
})

/**
 * DELETE /api/url-analysis/:analysisId
 * Delete a URL analysis
 */
router.delete('/:analysisId', authMiddleware, async (req, res) => {
  try {
    const { analysisId } = req.params
    const userId = req.user.id

    const deleted = await DatabaseService.deleteUrlAnalysis(analysisId, userId)
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      })
    }

    res.json({
      success: true,
      message: 'Analysis deleted successfully'
    })

  } catch (error) {
    logger.error('Failed to delete analysis:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete analysis'
    })
  }
})

export default router 