import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import EssayClient from './EssayClient'

export default async function EssayPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const { data: essays } = await supabase
    .from('essays')
    .select('*')
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false })

  return <EssayClient profile={profile} userId={session.user.id} essays={essays || []} />
}
