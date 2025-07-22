"use client"

import { createClient } from './supabase-client'
import { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  // Add any additional user properties if needed
}

export interface SignUpData {
  email: string
  password: string
  options?: {
    data?: {
      name?: string
    }
  }
}

export interface SignInData {
  email: string
  password: string
}

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function signUp({ email, password, options }: SignUpData) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options
  })

  if (error) {
    throw new AuthError(error.message, error.status?.toString())
  }

  return data
}

export async function signIn({ email, password }: SignInData) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw new AuthError(error.message, error.status?.toString())
  }

  return data
}

export async function signOut() {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new AuthError(error.message, error.status?.toString())
  }
}

export async function resetPassword(email: string, redirectUrl?: string) {
  const supabase = createClient()
  
  const redirectTo = redirectUrl || `${window.location.origin}/auth/reset-password`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo
  })

  if (error) {
    throw new AuthError(error.message, error.status?.toString())
  }
}

export async function updatePassword(password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.updateUser({
    password
  })

  if (error) {
    throw new AuthError(error.message, error.status?.toString())
  }

  return data
}

export async function getCurrentUser(): Promise<AuthUser | undefined> {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw new AuthError(error.message, error.status?.toString())
  }

  return user as AuthUser | undefined
}

export async function getSession() {
  const supabase = createClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    throw new AuthError(error.message, error.status?.toString())
  }

  return session
}