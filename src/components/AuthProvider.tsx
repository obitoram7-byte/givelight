"use client";

import { useState, useEffect } from 'react'
import { onAuthChange, getCurrentUserId } from '@/lib/firebase'
import { motion } from 'framer-motion'
import { User } from 'firebase/auth'

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return { user, loading, error, uid: user?.uid || null, isAnonymous: user?.isAnonymous || false }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthState()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return children
}