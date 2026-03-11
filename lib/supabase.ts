import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          user_type: 'pre-dental' | 'dental-student'
          created_at: string
          streak_count: number
          dat_target_score: number
          shadowing_hours: number
          schools_count: number
        }
        Insert: {
          id: string
          email: string
          full_name: string
          user_type: 'pre-dental' | 'dental-student'
          created_at?: string
          streak_count?: number
          dat_target_score?: number
          shadowing_hours?: number
          schools_count?: number
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          user_type?: 'pre-dental' | 'dental-student'
          created_at?: string
          streak_count?: number
          dat_target_score?: number
          shadowing_hours?: number
          schools_count?: number
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}
