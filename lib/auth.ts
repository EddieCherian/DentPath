import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// ── SERVER SIDE ──

export async function getSession() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) console.error('Error getting session:', error)
  return session
}

export async function getProfile() {
  const supabase = createServerComponentClient({ cookies })
  const session = await getSession()
  if (!session) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error) console.error('Error getting profile:', error)
  return profile
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

export async function requireProfile() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  return profile
}

// ── CLIENT SIDE ──

export function getClientSupabase() {
  return createClientComponentClient()
}

export async function signOut() {
  const supabase = createClientComponentClient()
  await supabase.auth.signOut()
}

export async function updateProfile(
  userId: string,
  updates: {
    full_name?: string
    dat_target_score?: number
    shadowing_hours?: number
    schools_count?: number
    streak_count?: number
  }
) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function incrementStreak(userId: string, currentStreak: number) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ streak_count: currentStreak + 1 })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
