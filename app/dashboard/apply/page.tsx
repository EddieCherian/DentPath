import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ApplyClient from './ApplyClient'

export default async function ApplyPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: applications } = await supabase
    .from('school_applications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return <ApplyClient applications={applications || []} profile={profile} userId={session.user.id} />
}
