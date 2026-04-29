/**
 * Admin auth helpers with enhanced security
 */
const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

export const isAdmin = () => {
  const user = getUser()
  return user?.role === 'admin'
}

/**
 * Clear all admin auth data
 * SECURITY: Removes all tokens and user data from both storages
 */
export const clearAdminAuth = () => {
  // Clear tokens
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  
  // Clear user data
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(USER_KEY)
  
  // Clear admin preferences
  localStorage.removeItem('adminTheme')
  localStorage.removeItem('adminLang')
}
