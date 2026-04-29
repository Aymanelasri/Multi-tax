// Use Vite environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL

// Extract CSRF token from cookies
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token')

// Fetch CSRF token needed for Sanctum (called before each request)
const fetchCSRFToken = async () => {
  try {
    await fetch(`${API_URL.replace('/api', '')}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
    })
  } catch (error) {
  }
}

const request = async (method, url, body = null, authToken = null) => {
  // 1. Fetch CSRF cookie (needed for Sanctum stateful auth, but Bearer tokens don't require it)
  await fetchCSRFToken()

  // 2. Build headers
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }

  // 3. Add Bearer token if available
  const token = authToken || getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // 4. Build request options
  const options = {
    method,
    headers,
    credentials: 'include', // Send/receive cookies for Sanctum
  }

  if (body) {
    options.body = JSON.stringify(body)
  }
  
  const response = await fetch(`${API_URL}${url}`, options)

  // SECURITY: Auto-logout on 401 Unauthorized (but not for login endpoint)
  if (response.status === 401 && !url.includes('/login')) {
    // Clear all auth data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    
    // Redirect to login if not already there
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }

  if (!response.ok) {
    let error
    try {
      error = await response.json()
    } catch {
      error = { message: response.statusText }
    }
    
    const errorMessage = error.errors
      ? Object.entries(error.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join(' | ')
      : error.message || `HTTP ${response.status}`
    throw new Error(errorMessage)
  }

  return response.json()
}

const api = {
  // Auth
  register: (firstname, lastname, email, phone, password, password_confirmation) =>
    request('POST', '/register', { firstname, lastname, email, phone, password, password_confirmation }),

  login: (email, password) =>
    request('POST', '/login', { email, password }),

  logout: () =>
    request('POST', '/logout'),

  getUser: (authToken = null) =>
    request('GET', '/user', null, authToken),

  // Societes
  getSocietes: () =>
    request('GET', '/societes'),

  getMyCompanies: () =>
    request('GET', '/societes/my-companies'),

  getSociete: (id) =>
    request('GET', `/societes/${id}`),

  createSociete: (data) =>
    request('POST', '/societes', data),

  updateSociete: (id, data) =>
    request('PUT', `/societes/${id}`, data),

  deleteSociete: (id) =>
    request('DELETE', `/societes/${id}`),

  incrementSocieteUsage: (id) =>
    request('POST', `/societes/${id}/increment-usage`),

  // Declarations
  getDeclarations: () =>
    request('GET', '/declarations'),

  createDeclaration: (data) =>
    request('POST', '/declarations', data),

  deleteDeclaration: (id) =>
    request('DELETE', `/declarations/${id}`),

  // Modules
  getModules: () =>
    request('GET', '/modules'),

  createModule: (data) =>
    request('POST', '/modules', data),

  deleteModule: (id) =>
    request('DELETE', `/modules/${id}`),

  // Historique
  getHistorique: () =>
    request('GET', '/historique'),

  createHistorique: (data) =>
    request('POST', '/historique', data),

  updateHistorique: (id, data) =>
    request('PUT', `/historique/${id}`, data),

  deleteHistorique: (id) =>
    request('DELETE', `/historique/${id}`),

  // Log action (convenience method)
  logAction: (action, description, societe_id = null, data = null) =>
    request('POST', '/historique', {
      action,
      description,
      societe_id,
      data
    }),

  // Generations
  getGenerations: () =>
    request('GET', '/generations'),

  createGeneration: (data) =>
    request('POST', '/generations', data),

  downloadGeneration: async (id) => {
    const token = getToken()
    const headers = {
      'Authorization': `Bearer ${token}`,
    }
    
    const response = await fetch(`${API_URL}/generations/${id}/download`, {
      method: 'GET',
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Download failed')
    }

    return response.blob()
  },

  // Admin
  getAdminUsers: () =>
    request('GET', '/admin/users'),

  approveUser: (id) =>
    request('PUT', `/admin/users/${id}/approve`),

  rejectUser: (id) =>
    request('PUT', `/admin/users/${id}/reject`),

  // Email verification
  resendVerification: (email) =>
    request('POST', '/email/resend-verification', { email }),

  // Password reset
  forgotPassword: (email) =>
    request('POST', '/password/forgot', { email }),

  resetPassword: (token, email, password, password_confirmation) =>
    request('POST', '/password/reset', { token, email, password, password_confirmation }),

  // Password update (authenticated user)
  updatePassword: (currentPassword, newPassword, newPasswordConfirmation) =>
    request('POST', '/password/update', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation
    }),

  // Profile update (authenticated user)
  updateProfile: (data) =>
    request('PUT', '/profile', data),

  // Contact Form (public)
  submitContact: (name, email, subject, message) =>
    request('POST', '/contact', { name, email, subject, message }),

  // Update user (admin)
  updateUser: (id, data) =>
    request('PUT', `/admin/users/${id}`, data),

  deleteUser: (id) =>
    request('DELETE', `/admin/users/${id}`),

  // Generic methods for flexibility (returns {data: ...} format for compatibility)
  get: async (url) => {
    const result = await request('GET', url)
    return { data: result }
  },

  post: async (url, data) => {
    const result = await request('POST', url, data)
    return { data: result }
  },

  put: async (url, data) => {
    const result = await request('PUT', url, data)
    return { data: result }
  },

  delete: async (url) => {
    const result = await request('DELETE', url)
    return { data: result }
  },
}

export default api
