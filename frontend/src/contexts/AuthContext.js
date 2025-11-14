import React, { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        // Customize error messages
        if (error.message.includes('already registered') || error.status === 400) {
          throw new Error('User already registered with this email')
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    try {
      // Try graceful logout first
      try {
        await supabase.auth.signOut({ scope: 'local' })
      } catch (supabaseError) {
        console.warn('Supabase logout failed, forcing local cleanup:', supabaseError)
      }

      // Force complete cleanup
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('redirectAfterLogin')
      localStorage.clear()
      sessionStorage.clear()

      // Clear cookies (if any)
      document.cookie.split(';').forEach(c => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
      })

      // Set user to null
      setUser(null)

      return { success: true }
    } catch (error) {
      console.error('Critical logout error:', error)

      // Last resort - force everything
      localStorage.clear()
      sessionStorage.clear()
      setUser(null)

      return { success: false, error }
    }
  }
  const resetPassword = async email => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
