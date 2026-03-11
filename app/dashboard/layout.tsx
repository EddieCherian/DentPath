import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#05080F] flex">
      <Sidebar userType={profile?.user_type || 'pre-dental'} />
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <Navbar
          fullName={profile?.full_name || ''}
          email={session.user.email || ''}
        />
        <main className="flex-1 pt-16">
          {children}
        </main>
      </div>
    </div>
  )
}
