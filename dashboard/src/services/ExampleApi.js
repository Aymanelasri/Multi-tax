/**
 * EXAMPLE: How to use the new API service in components
 * 
 * This file shows best practices for making API calls with authentication
 */

import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { getUser } from '../services/auth'

/**
 * Example: Admin Overview Component
 */
export default function ExampleAdminOverview({ showToast }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      // GET request with automatic Bearer token
      const response = await api.get('/admin/stats')
      setStats(response.data)
      showToast('Statistiques rechargées', 'success')
    } catch (error) {
      showToast(`Erreur: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Chargement...</div>

  return <div>{/* Your UI here */}</div>
}

/**
 * Example: User list Api calls
 */
export const exampleUserActions = {
  /**
   * Get all users
   * GET /admin/users
   */
  getAllUsers: async () => {
    const response = await api.get('/admin/users')
    return response.data
  },

  /**
   * Get pending users
   * GET /admin/users/pending
   */
  getPendingUsers: async () => {
    const response = await api.get('/admin/users/pending')
    return response.data
  },

  /**
   * Approve user
   * PUT /admin/users/:id/approve
   */
  approveUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/approve`)
    return response.data
  },

  /**
   * Reject user
   * PUT /admin/users/:id/reject
   */
  rejectUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/reject`)
    return response.data
  },

  /**
   * Delete user
   * DELETE /admin/users/:id
   */
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`)
    return response.data
  }
}

/**
 * Example: Companies API calls
 */
export const exampleCompaniesActions = {
  /**
   * Get all companies
   * GET /admin/societes
   */
  getAllCompanies: async () => {
    const response = await api.get('/admin/societes')
    return response.data
  }
}

/**
 * Example: Declarations API calls
 */
export const exampleDeclarationsActions = {
  /**
   * Get all declarations
   * GET /admin/declarations
   */
  getAllDeclarations: async () => {
    const response = await api.get('/admin/declarations')
    return response.data
  }
}

/**
 * Example: Usage in component
 * 
 * import { exampleUserActions } from '../services/ExampleApi'
 * 
 * const handleApprove = async (userId) => {
 *   try {
 *     await exampleUserActions.approveUser(userId)
 *     showToast('Utilisateur approuvé', 'success')
 *   } catch (error) {
 *     showToast(error.message, 'error')
 *   }
 * }
 */
