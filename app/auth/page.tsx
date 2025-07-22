'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import SignInForm from '../components/auth/SignInForm'
import SignUpForm from '../components/auth/SignUpForm'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password'>('signin')
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = searchParams.get('redirectTo') || '/'

  useEffect(() => {
    // If user is already authenticated, redirect them
    if (!loading && user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
  }

  const showForgotPassword = () => {
    setMode('forgot-password')
  }

  const backToSignIn = () => {
    setMode('signin')
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  // If user is authenticated, show loading while redirecting
  if (user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tabletop Tracker
          </h1>
          <p className="text-gray-600">
            Track board game plays, wins, losses and more!
          </p>
        </div>

        {mode === 'signin' && (
          <SignInForm 
            onToggleMode={toggleMode} 
            onForgotPassword={showForgotPassword}
            redirectTo={redirectTo} 
          />
        )}
        
        {mode === 'signup' && (
          <SignUpForm onToggleMode={toggleMode} />
        )}
        
        {mode === 'forgot-password' && (
          <ForgotPasswordForm onBack={backToSignIn} />
        )}
      </div>
    </main>
  )
}