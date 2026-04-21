import React, { useState, useEffect } from 'react'
import api from '../lib/api'

export default function AdminSettings({ showToast }) {
  // Profile section state
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  })
  const [profileLoading, setProfileLoading] = useState(false)

  // Password section state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState({})

  // Load user data on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setProfileData({
          name: user.name || `${user.firstname} ${user.lastname}` || '',
          email: user.email || ''
        })
      } catch (error) {
        console.error('Failed to parse user:', error)
      }
    }
  }, [])

  // Handle profile field changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle password field changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Save profile
  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      showToast('Name cannot be empty', 'error')
      return
    }
    if (!profileData.email.trim()) {
      showToast('Email cannot be empty', 'error')
      return
    }

    setProfileLoading(true)
    try {
      const response = await api.request('PUT', '/admin/profile', {
        name: profileData.name,
        email: profileData.email
      })

      // Update localStorage with new user data
      const updatedUser = response || response.user
      localStorage.setItem('user', JSON.stringify(updatedUser))

      showToast('Profile updated successfully', 'success')
    } catch (error) {
      console.error('Profile update error:', error)
      const errorMsg = error.message || 'Failed to update profile'
      showToast(errorMsg, 'error')
    } finally {
      setProfileLoading(false)
    }
  }

  // Validate and save password
  const handleSavePassword = async () => {
    const errors = {}

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters'
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required'
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    setPasswordLoading(true)
    try {
      await api.updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      )

      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setPasswordErrors({})

      showToast('Password updated successfully', 'success')
    } catch (error) {
      console.error('Password update error:', error)
      const errorMsg = error.message || 'Failed to update password'
      if (errorMsg.includes('current')) {
        setPasswordErrors({ currentPassword: errorMsg })
      } else {
        showToast(errorMsg, 'error')
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>⚙️ Settings</h1>
          <p className="admin-page-subtitle">Manage your admin account settings</p>
        </div>
      </div>

      <div className="settings-container">
        {/* Profile Section */}
        <div className="settings-section">
          <h2 className="settings-section-title">👤 Profile</h2>
          <div className="settings-form-group">
            <div className="settings-form-row">
              <div className="settings-form-field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  placeholder="Enter your name"
                  className="settings-input"
                />
              </div>
              <div className="settings-form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  placeholder="Enter your email"
                  className="settings-input"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={profileLoading}
              className="settings-save-btn"
            >
              {profileLoading ? '⏳ Saving...' : '💾 Save Profile'}
            </button>
          </div>
        </div>

        {/* Password Section */}
        <div className="settings-section">
          <h2 className="settings-section-title">🔐 Change Password</h2>
          <div className="settings-form-group">
            <div className="settings-form-field">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                className={`settings-input ${passwordErrors.currentPassword ? 'error' : ''}`}
              />
              {passwordErrors.currentPassword && (
                <span className="settings-error">{passwordErrors.currentPassword}</span>
              )}
            </div>

            <div className="settings-form-row">
              <div className="settings-form-field">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Min 8 characters"
                  className={`settings-input ${passwordErrors.newPassword ? 'error' : ''}`}
                />
                {passwordErrors.newPassword && (
                  <span className="settings-error">{passwordErrors.newPassword}</span>
                )}
              </div>

              <div className="settings-form-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className={`settings-input ${passwordErrors.confirmPassword ? 'error' : ''}`}
                />
                {passwordErrors.confirmPassword && (
                  <span className="settings-error">{passwordErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            <button
              onClick={handleSavePassword}
              disabled={passwordLoading}
              className="settings-save-btn"
            >
              {passwordLoading ? '⏳ Saving...' : '💾 Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}