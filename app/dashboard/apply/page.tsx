import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ApplyClient from './Client'

export const dynamic = 'force-dynamic'

export default async function ApplyPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Fetch user's applications
  const { data: applications } = await supabase
    .from('school_applications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('deadline', { ascending: true })

  // Fetch user's essays
  const { data: essays } = await supabase
    .from('essays')
    .select('*')
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false })

  return (
    <ApplyClient 
      applications={applications || []} 
      essays={essays || []}
    />
  )
}
