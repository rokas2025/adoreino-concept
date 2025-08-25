// Authentication Routes - JWT auth with GitHub OAuth
import express from 'express'
import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger.js'
import { GitHubService } from '../services/GitHubService.js'
import { DatabaseService } from '../services/DatabaseService.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

/**
 * GET /api/auth/github
 * Initiate GitHub OAuth flow
 */
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = `${process.env.FRONTEND_URL}/auth/github/callback`
  
  if (!clientId) {
    return res.status(500).json({
      success: false,
      error: 'GitHub OAuth not configured'
    })
  }

  const scope = 'user:email,repo'
  const state = jwt.sign({ timestamp: Date.now() }, process.env.JWT_SECRET, { expiresIn: '10m' })
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`
  
  res.json({
    success: true,
    authUrl: githubAuthUrl,
    state
  })
})

/**
 * POST /api/auth/github/callback
 * Handle GitHub OAuth callback
 */
router.post('/github/callback', async (req, res) => {
  try {
    const { code, state } = req.body
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code required'
      })
    }

    // Verify state parameter
    try {
      jwt.verify(state, process.env.JWT_SECRET)
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid state parameter'
      })
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()
    logger.info('GitHub token response:', { 
      hasAccessToken: !!tokenData.access_token,
      tokenType: tokenData.token_type,
      scope: tokenData.scope,
      error: tokenData.error 
    })
    
    if (tokenData.error) {
      logger.error('GitHub OAuth token error:', tokenData)
      return res.status(400).json({
        success: false,
        error: 'GitHub OAuth failed',
        details: tokenData.error_description
      })
    }

    const accessToken = tokenData.access_token
    
    if (!accessToken) {
      logger.error('No access token in GitHub response')
      return res.status(400).json({
        success: false,
        error: 'No access token received from GitHub'
      })
    }

    // Get user information from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CodeAnalyst-App'
      },
    })

    if (!userResponse.ok) {
      logger.error('GitHub API user fetch failed:', {
        status: userResponse.status,
        statusText: userResponse.statusText
      })
      return res.status(400).json({
        success: false,
        error: `GitHub API error: ${userResponse.status} ${userResponse.statusText}`
      })
    }

    const githubUser = await userResponse.json()
    logger.info('GitHub user data received:', { 
      id: githubUser.id, 
      login: githubUser.login,
      name: githubUser.name 
    })

    if (!githubUser.id) {
      logger.error('No GitHub user ID in response:', githubUser)
      return res.status(400).json({
        success: false,
        error: 'Failed to get user information from GitHub',
        details: 'No user ID in GitHub response'
      })
    }

    // Get user email (might be private)
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CodeAnalyst-App'
      },
    })

    const emails = await emailResponse.json()
    const primaryEmail = emails.find(email => email.primary)?.email || githubUser.email

    // Create or update user in database
    let user
    try {
      // Try to find existing user
      user = await DatabaseService.getUserByGithubId(githubUser.id)
      
      if (user) {
        // Update existing user
        user = await DatabaseService.updateUser(user.id, {
          github_username: githubUser.login,
          github_access_token: accessToken,
          name: githubUser.name || githubUser.login,
          avatar_url: githubUser.avatar_url,
          last_login: new Date().toISOString()
        })
      } else {
        // Create new user
        user = await DatabaseService.createUser({
          github_id: githubUser.id,
          github_username: githubUser.login,
          github_access_token: accessToken,
          email: primaryEmail,
          name: githubUser.name || githubUser.login,
          avatar_url: githubUser.avatar_url,
          plan: 'free'
        })
      }
    } catch (dbError) {
      logger.error('Database error during GitHub auth:', dbError)
      return res.status(500).json({
        success: false,
        error: 'Database error during authentication'
      })
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { 
        userId: user.id,
        githubId: githubUser.id,
        githubUsername: githubUser.login
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    logger.info('GitHub OAuth successful', { 
      userId: user.id, 
      githubUsername: githubUser.login,
      email: primaryEmail 
    })

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        githubUsername: user.github_username,
        avatarUrl: user.avatar_url,
        plan: user.plan,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    })

  } catch (error) {
    logger.error('GitHub OAuth callback failed:', error)
    res.status(500).json({
      success: false,
      error: 'OAuth authentication failed'
    })
  }
})

/**
 * GET /api/auth/github/repos
 * Get user's GitHub repositories
 */
router.get('/github/repos', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    // Get user's GitHub access token
    const user = await DatabaseService.getUserById(userId)
    if (!user?.github_access_token) {
      return res.status(400).json({
        success: false,
        error: 'GitHub account not connected'
      })
    }

    // Get repositories from GitHub
    const repos = await GitHubService.getUserRepositories(user.github_access_token)
    
    res.json({
      success: true,
      repositories: repos
    })

  } catch (error) {
    logger.error('Failed to get GitHub repos:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch repositories'
    })
  }
})

/**
 * POST /api/auth/login
 * Simple login for development (fallback)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      })
    }

    // For development, accept any credentials
    const token = `dev-token-${Date.now()}`
    
    logger.info('Development login', { email })
    
    res.json({
      success: true,
      token,
      user: {
        id: 'dev-user-1',
        email,
        name: 'Development User',
        plan: 'free'
      }
    })

  } catch (error) {
    logger.error('Login failed:', error)
    res.status(500).json({
      success: false,
      error: 'Login failed'
    })
  }
})

/**
 * POST /api/auth/register
 * Simple registration for development
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body
    
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password and name required'
      })
    }

    // Generate a fake JWT token for development
    const token = `dev-token-${Date.now()}`
    
    logger.info('Development registration', { email, name })
    
    res.json({
      success: true,
      token,
      user: {
        id: 'dev-user-1',
        email,
        name,
        plan: 'free'
      }
    })

  } catch (error) {
    logger.error('Registration failed:', error)
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    })
  }
})

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', async (req, res) => {
  try {
    // For development, return a fake user
    res.json({
      success: true,
      user: {
        id: 'dev-user-1',
        email: 'dev@codeanalyst.ai',
        name: 'Development User',
        plan: 'free'
      }
    })

  } catch (error) {
    logger.error('Get user failed:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get user'
    })
  }
})

export default router 