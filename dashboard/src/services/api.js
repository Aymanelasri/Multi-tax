import { getToken } from './auth'

// Fixed base URL for API - Do NOT change
const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api'

// Prevent infinite redirect loops on 401
let isRedirecting = false

/**
 * Fetch wrapper for API calls with automatic Bearer token injection
 * and 401 error handling
 */
const api = {
  async request(method, endpoint, data = null) {
    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`
    
    console.log(`📤 [${method}] ${url}${data ? ' | payload: ' + JSON.stringify(data) : ''}`)
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

    // Add token if available
    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
      console.log(`🔑 Token present: ${token.substring(0, 20)}...`)
    } else {
      console.warn('⚠️ No token found in localStorage - user may not be authenticated')
    }

    const options = {
      method,
      headers
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, options)

      // Handle 401 - Token expired or invalid
      if (response.status === 401) {
        if (!isRedirecting) {
          isRedirecting = true
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')
          localStorage.removeItem('user')
          sessionStorage.removeItem('user')
          console.warn('🔐 Unauthorized (401) - Token invalid, redirecting to frontend login')
          // Redirect to FRONTEND login page (not dashboard /login which doesn't exist)
          setTimeout(() => {
            window.location.href = 'http://localhost:3000/login'
          }, 100)
        }
        return null
      }

      // Parse JSON response
      let responseData = null
      if (response.headers.get('content-type')?.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      // For non-2xx responses, throw error with response data
      if (!response.ok) {
        console.error(`❌ [${method}] ${url} - ${response.status}:`, responseData)
        const error = new Error(responseData?.message || `HTTP ${response.status}`)
        error.response = {
          status: response.status,
          data: responseData
        }
        throw error
      }

      // Return axios-like response object for compatibility
      console.log(`✅ [${method}] ${url} - ${response.status} OK`)
      return {
        data: responseData,
        status: response.status,
        headers: response.headers
      }
    } catch (error) {
      // Re-throw with response attached if available
      console.error(`⚠️ API Error on [${method}] ${url}:`, error.message)
      throw error
    }
  },

  get(endpoint) {
    return this.request('GET', endpoint)
  },

  post(endpoint, data) {
    return this.request('POST', endpoint, data)
  },

  put(endpoint, data) {
    return this.request('PUT', endpoint, data)
  },

  patch(endpoint, data) {
    return this.request('PATCH', endpoint, data)
  },

  delete(endpoint) {
    return this.request('DELETE', endpoint)
  }
}

export default api
