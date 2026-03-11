# DentPath 🦷

The complete platform for dental students — from pre-dental to DDS.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase
- **Deployment:** Vercel

---

## Project Structure

```
dentpath/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   └── dashboard/
│       ├── layout.tsx
│       └── page.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── ModuleCard.tsx
│   └── ui/
│       └── Button.tsx
├── lib/
│   ├── supabase.ts
│   └── auth.ts
├── types/
│   └── index.ts
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Step 1 — Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project** and give it a name
3. Go to **SQL Editor** and run this SQL to create your tables:

```sql
-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  user_type text not null default 'pre-dental',
  created_at timestamptz default now(),
  streak_count integer default 0,
  dat_target_score integer default 20,
  shadowing_hours integer default 0,
  schools_count integer default 0
);

-- Sessions table
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;

-- Policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can view own sessions"
  on sessions for select
  using (auth.uid() = user_id);
```

4. Go to **Authentication → Providers** and enable **Google**
5. Add your Google OAuth credentials (from Google Cloud Console)
6. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public` key
   - `service_role` key

---

## Step 2 — Push to GitHub

1. Create a new repo at [github.com](https://github.com) called `dentpath`
2. Upload all these files maintaining the exact folder structure
3. Commit and push

---

## Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project** and import your `dentpath` repo
3. Set these build settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `next build`
   - **Output Directory:** `.next`
4. Add these **Environment Variables** in Vercel dashboard under Settings → Environment Variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |

5. Click **Deploy** ✅

---

## Step 4 — Add Your Vercel URL to Supabase

1. Go back to Supabase → **Authentication → URL Configuration**
2. Add your Vercel URL to **Site URL**: `https://dentpath.vercel.app`
3. Add to **Redirect URLs**: `https://dentpath.vercel.app/auth/callback`

---

## Auth Callback Route

Create this file to handle OAuth redirects:

### `app/auth/callback/route.ts`
```ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

---

## Local Development (Optional)

If you ever want to run locally, create a `.env.local` file (never commit this):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Roadmap

- [x] Phase 1 — Foundation (Auth, Dashboard, Profiles)
- [ ] Phase 2 — DAT Prep Suite
- [ ] Phase 3 — Application & Interview Tools
- [ ] Phase 4 — Clinical Tracker & Board Prep
- [ ] Phase 5 — Community & Mentorship
- [ ] Phase 6 — Career & Specialty Planning
- [ ] Phase 7 — AI Layer (Gemini)

---

Built with ❤️ for dental students everywhere.
