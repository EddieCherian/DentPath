export type UserType = 'pre-dental' | 'dental-student'

export interface Profile {
  id: string
  email: string
  full_name: string
  user_type: UserType
  created_at: string
  streak_count: number
  dat_target_score: number
  shadowing_hours: number
  schools_count: number
}

export interface Module {
  id: string
  title: string
  description: string
  href: string
  icon: string
  status: 'active' | 'coming-soon'
  color: 'teal' | 'gold' | 'blue' | 'rose'
  phase: number
}

export interface DATQuestion {
  id: string
  subject: 'biology' | 'general-chem' | 'organic-chem' | 'pat' | 'reading' | 'math'
  question: string
  options: string[]
  correct_index: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
}

export interface School {
  id: string
  name: string
  location: string
  avg_gpa: number
  avg_dat: number
  acceptance_rate: number
  tuition: number
  class_size: number
  curriculum: 'traditional' | 'PBL' | 'hybrid'
  interview_format: 'MMI' | 'traditional' | 'both'
  website: string
}

export interface ApplicationEntry {
  id: string
  user_id: string
  school_id: string
  school_name: string
  status: 'planning' | 'applied' | 'interview' | 'waitlisted' | 'accepted' | 'rejected'
  applied_date?: string
  interview_date?: string
  decision_date?: string
  notes?: string
  created_at: string
}

export interface ProcedureLog {
  id: string
  user_id: string
  procedure_type: string
  tooth_number?: string
  date: string
  notes?: string
  competency_level: 'observed' | 'assisted' | 'performed'
  created_at: string
}

export interface ForumPost {
  id: string
  user_id: string
  author_name: string
  author_type: UserType
  topic: string
  title: string
  content: string
  upvotes: number
  reply_count: number
  created_at: string
}

export interface NavLink {
  href: string
  label: string
  icon: string
}

export interface StatCard {
  label: string
  value: string | number
  unit?: string
  color: 'teal' | 'gold' | 'blue' | 'rose'
  icon: string
}
