import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../lib/api'

/**
 * This page handles email verification link clicks from the email
 * It calls the API to verify the email and immediately redirects to /login
 */
export default function EmailVerificationLink() {
  const navigate = useNavigate()
  const { id, hash } = useParams()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Call the backend API to verify the email
        const response = await fetch(
          `http://localhost:8000/api/email/verify/${id}/${hash}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        )

        const data = await response.json()

        // Whether success or not, redirect to login
        // Backend returns 200 for both "verified successfully" and "already verified"
        if (response.ok || response.status === 200) {
          // Redirect immediately to login with no message
          navigate('/login', { replace: true })
        } else {
          // On error, still redirect to login
          navigate('/login', { replace: true })
        }
      } catch (error) {
        console.error('Email verification error:', error)
        // Redirect to login even on error
        navigate('/login', { replace: true })
      }
    }

    if (id && hash) {
      verifyEmail()
    } else {
      // Invalid url, redirect to home
      navigate('/', { replace: true })
    }
  }, [id, hash, navigate])

  // Show nothing while processing
  return null
}
