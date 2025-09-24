import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scans: {
        Row: {
          id: string
          user_id: string | null
          symptoms: string[]
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          symptoms: string[]
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          symptoms?: string[]
          date?: string
          created_at?: string
        }
      }
      shared_scans: {
        Row: {
          id: string
          scan_id: string | null
          user_name: string
          symptoms: string[]
          date: string
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id: string
          scan_id?: string | null
          user_name: string
          symptoms: string[]
          date: string
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          scan_id?: string | null
          user_name?: string
          symptoms?: string[]
          date?: string
          created_at?: string
          expires_at?: string | null
        }
      }
    }
  }
}
