# DSA Tracker — Personal Problem Solving & Mastery Suite

A production-quality personal web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL + Auth)** to track, organize, and master Data Structures and Algorithms problems.

---

## Features

- **Secure Authentication**: Supabase Auth with cookie-based session verification and middleware route protection.
- **Personal Dashboard**: Total problems tracked, solved/attempted/unsolved metrics, completion %, difficulty distributions (Easy/Medium/Hard), topic mastery breakdown, and recent activity.
- **Problem Organization**: Categorize by platform (*LeetCode*, *CodeChef*, *HackerRank*, *GeeksforGeeks*, *Other*), topic, algorithmic pattern, and status (*Unsolved*, *Attempted*, *Solved*).
- **Structured Solution Notes**:
  - Time & Space Complexity analysis chips
  - Optimal Approach & Code snippets
  - Brute Force intuition & comparison
  - Mistakes & Pitfalls (what to watch out for)
  - Follow-up & revision notes
- **1-Click Status Transitions**: Mark as Solved, Attempted, or Unsolved with automatic timestamping of `date_solved` and instant reactive dashboard updates.
- **Search & Multi-Faceted Filters**: Instant debounced search (by title, topic, pattern) with difficulty, status, platform, and sorting controls synced to URL parameters.
- **Dual View Modes**: Switch between responsive Table View and Card Grid View.
- **Strict Row Level Security (RLS)**: PostgreSQL-enforced multi-tenant isolation ensuring each user can strictly query and mutate only their own problems.

---

## Technology Stack

- **Framework**: Next.js 14 (App Router, Server Components & Server Actions)
- **Language**: TypeScript (strict type checking)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form + Zod
- **Database & Auth**: PostgreSQL via Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **Deployment**: Vercel ready

---

## Getting Started

### 1. Prerequisites

- Node.js `v18.17+` or `v20+` / `v24+`
- A free [Supabase](https://supabase.com) account and project

### 2. Configure Supabase Database

1. Open your Supabase Project Dashboard and go to the **SQL Editor**.
2. Run the SQL script located in `supabase/schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create problems table
CREATE TABLE IF NOT EXISTS public.problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('LeetCode', 'CodeChef', 'HackerRank', 'GeeksforGeeks', 'Other')) DEFAULT 'LeetCode',
    problem_url TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    topic TEXT NOT NULL,
    pattern TEXT,
    status TEXT NOT NULL CHECK (status IN ('Unsolved', 'Attempted', 'Solved')) DEFAULT 'Unsolved',
    description TEXT,
    approach TEXT,
    brute_force TEXT,
    optimal_approach TEXT,
    time_complexity TEXT,
    space_complexity TEXT,
    mistakes TEXT,
    notes TEXT,
    date_added TIMESTAMPTZ NOT NULL DEFAULT now(),
    date_solved TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_problems_user_id ON public.problems(user_id);
CREATE INDEX IF NOT EXISTS idx_problems_user_status ON public.problems(user_id, status);
CREATE INDEX IF NOT EXISTS idx_problems_user_difficulty ON public.problems(user_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_user_topic ON public.problems(user_id, topic);
CREATE INDEX IF NOT EXISTS idx_problems_user_date_added ON public.problems(user_id, date_added DESC);

-- Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_problems_updated_at ON public.problems;
CREATE TRIGGER set_problems_updated_at
    BEFORE UPDATE ON public.problems
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security (RLS)
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own problems"
    ON public.problems FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own problems"
    ON public.problems FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own problems"
    ON public.problems FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own problems"
    ON public.problems FOR DELETE
    USING (auth.uid() = user_id);
```

### 3. Configure Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

*(You can obtain these from your Supabase Dashboard under **Project Settings -> API** or **Connect -> Framework -> Next.js**)*

### 4. Run Locally

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Application Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Sign In page
│   │   ├── register/page.tsx       # Sign Up page
│   │   ├── auth/callback/route.ts  # Supabase Auth code exchange handler
│   │   └── layout.tsx              # Auth shell layout
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx      # Main Dashboard stats & activity
│   │   ├── problems/
│   │   │   ├── page.tsx            # Problem list with search/filter/sort
│   │   │   ├── new/page.tsx        # Add problem page
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Problem details & quick status actions
│   │   │       └── edit/page.tsx   # Edit problem page
│   │   └── layout.tsx              # Authenticated shell (Sidebar, Mobile Header)
│   ├── globals.css                 # Dark theme & styling tokens
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Root redirection
│   └── not-found.tsx               # 404 page
├── components/
│   ├── ui/                         # Button, Badge, Input, Textarea, Select, Card, Modal, Skeleton, Alert
│   ├── navigation/                 # Sidebar, Header, UserMenu
│   ├── dashboard/                  # StatCards, DifficultyBreakdown, TopicDistribution, RecentActivity
│   └── problems/                   # ProblemForm, ProblemFilters, ProblemTable, ProblemCard, ProblemsView, StatusActions
├── lib/
│   ├── supabase/                   # Client, Server, and Middleware Supabase helpers
│   ├── actions/                    # Next.js Server Actions (auth & problems CRUD)
│   ├── validations/                # Zod validation schemas
│   ├── constants/                  # DSA constants (topics, patterns, platforms, difficulties)
│   └── utils.ts                    # Styling & date utility helpers
├── types/
│   ├── database.types.ts           # PostgreSQL / Supabase types
│   └── dsa.types.ts                # TypeScript domain & UI filter types
├── supabase/
│   └── schema.sql                  # Database migration schema
└── middleware.ts                   # Next.js edge route protection
```

---

## Deployment to Vercel

1. Push your code to a GitHub repository.
2. Import the repository into [Vercel](https://vercel.com).
3. In the Vercel project settings, add the Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Click **Deploy**. Vercel will automatically build and deploy the Next.js application.

---

## Key Verification Checks

- [x] TypeScript type checking: `npx tsc --noEmit` (Passed with 0 errors)
- [x] Linting: `npm run lint` (Passed with 0 warnings/errors)
- [x] Production build: `npm run build` (Generated all static and dynamic routes cleanly)
