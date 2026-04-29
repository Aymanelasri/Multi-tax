/**
 * Auth helpers for token management
 */

// Use same token key as frontend for compatibility
const TOKEN_KEY = 'token'
const USER_KEY = 'user'

/**
 * Get stored token from localStorage or sessionStorage
 * Frontend stores in sessionStorage if "Remember me" is unchecked
 * @returns {string|null} JWT token or null
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

/**
 * Save token to localStorage (default storage)
 * @param {string} token JWT token
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    // Also check sessionStorage in case frontend stored it there
    if (sessionStorage.getItem(TOKEN_KEY)) {
      sessionStorage.setItem(TOKEN_KEY, token)
    }
  }
}

/**
 * Remove token from both localStorage and sessionStorage
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(USER_KEY)
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getToken()
}

/**
 * Get stored user data
 * @returns {object|null}
 */
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

/**
 * Save user data to localStorage
 * @param {object} user User object
 */
export const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

/**
 * Check if user is admin
 * @returns {boolean}
 */
export const isAdmin = () => {
  const user = getUser()
  return user?.role === 'admin'
}

/**
 * Clear all auth data
 */
export const clearAuth = () => {
  removeToken()
}
