"use client"

import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export interface Profile {
  id: string
  name: string | null
  email: string | null
}

export interface Scan {
  id: string
  user_id: string | null
  symptoms: string[]
  date: string
  created_at: string
}

interface AuthState {
  user: User | null
  profile: Profile | null
  scans: Scan[]
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => Promise<void>
  loadUserData: () => Promise<void>
  addScan: (symptoms: string[]) => Promise<void>
  refreshScans: () => Promise<void>
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  scans: [],
  loading: true,

  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        set({ user: data.user })
        await get().loadUserData()
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  },

  signup: async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        set({ user: data.user })
        return true
      }
      return false
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut()
      set({ user: null, profile: null, scans: [] })
    } catch (error) {
      console.error("Logout error:", error)
    }
  },

  loadUserData: async () => {
    const { user } = get()
    if (!user) return

    try {
      // Load profile
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profile) {
        set({ profile })
      }

      // Load scans
      await get().refreshScans()
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      set({ loading: false })
    }
  },

  addScan: async (symptoms: string[]) => {
    const { user } = get()
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("scans")
        .insert({
          user_id: user.id,
          symptoms,
          date: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        set((state) => ({
          scans: [data, ...state.scans],
        }))
      }
    } catch (error) {
      console.error("Error adding scan:", error)
    }
  },

  refreshScans: async () => {
    const { user } = get()
    if (!user) return

    try {
      const { data: scans } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (scans) {
        set({ scans })
      }
    } catch (error) {
      console.error("Error refreshing scans:", error)
    }
  },
}))

// Initialize auth state
supabase.auth.onAuthStateChange(async (event, session) => {
  const { loadUserData } = useAuth.getState()

  if (session?.user) {
    useAuth.setState({ user: session.user })
    await loadUserData()
  } else {
    useAuth.setState({ user: null, profile: null, scans: [], loading: false })
  }
})

// Load initial session
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) {
    useAuth.setState({ user: session.user })
    useAuth.getState().loadUserData()
  } else {
    useAuth.setState({ loading: false })
  }
})
