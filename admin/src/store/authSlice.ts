'use client'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AuthUser {
  _id?: string
  id?: string
  name?: string
  email?: string
  role?: string
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
}

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

const getUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null

  try {
    const storedUser = localStorage.getItem('user')
    return storedUser ? (JSON.parse(storedUser) as AuthUser) : null
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

const initialToken = getToken()

const initialState: AuthState = {
  token: initialToken,
  user: initialToken ? getUser() : null,
  isAuthenticated: Boolean(initialToken),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: AuthUser }>) => {
      const { token, user } = action.payload

      state.token = token
      state.user = user
      state.isAuthenticated = true

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        // Cookie for Next.js middleware. Secure on HTTPS deployments.
        const secure = window.location.protocol === 'https:' ? '; Secure' : ''
        document.cookie = `token=${encodeURIComponent(token)}; Path=/; Max-Age=86400; SameSite=Lax${secure}`
      }
    },

    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (!state.user) return
      state.user = { ...state.user, ...action.payload }

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(state.user))
      }
    },

    logout: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false

      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        document.cookie = 'token=; Path=/; Max-Age=0; SameSite=Lax'
      }
    },
  },
})

export const { setCredentials, logout, updateUser } = authSlice.actions

export default authSlice.reducer
