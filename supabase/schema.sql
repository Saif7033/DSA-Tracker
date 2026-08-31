-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------
-- 1. PROBLEMS TABLE
-- ----------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_problems_user_id ON public.problems(user_id);
CREATE INDEX IF NOT EXISTS idx_problems_user_status ON public.problems(user_id, status);
CREATE INDEX IF NOT EXISTS idx_problems_user_difficulty ON public.problems(user_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_user_topic ON public.problems(user_id, topic);
CREATE INDEX IF NOT EXISTS idx_problems_user_date_added ON public.problems(user_id, date_added DESC);

-- Automatic updated_at Trigger function
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

-- Problems RLS
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own problems" ON public.problems;
DROP POLICY IF EXISTS "Users can create their own problems" ON public.problems;
DROP POLICY IF EXISTS "Users can update their own problems" ON public.problems;
DROP POLICY IF EXISTS "Users can delete their own problems" ON public.problems;

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

-- ----------------------------------------------------
-- 2. USER PROFILES TABLE
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    provider TEXT DEFAULT 'email',
    daily_goal INTEGER NOT NULL DEFAULT 3 CHECK (daily_goal IN (1, 2, 3, 5, 10)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------
-- 3. DAILY ACTIVITY TABLE (Authoritative Historical Tracking)
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    problems_solved INTEGER NOT NULL DEFAULT 0,
    regular_problems_solved INTEGER NOT NULL DEFAULT 0,
    daily_challenge_solved INTEGER NOT NULL DEFAULT 0,
    daily_goal INTEGER NOT NULL DEFAULT 3,
    goal_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_activity_date UNIQUE (user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON public.daily_activity(user_id, activity_date DESC);

DROP TRIGGER IF EXISTS set_daily_activity_updated_at ON public.daily_activity;
CREATE TRIGGER set_daily_activity_updated_at
    BEFORE UPDATE ON public.daily_activity
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own daily activity" ON public.daily_activity;
DROP POLICY IF EXISTS "Users can insert their own daily activity" ON public.daily_activity;
DROP POLICY IF EXISTS "Users can update their own daily activity" ON public.daily_activity;
DROP POLICY IF EXISTS "Users can delete their own daily activity" ON public.daily_activity;

CREATE POLICY "Users can view their own daily activity"
    ON public.daily_activity FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily activity"
    ON public.daily_activity FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily activity"
    ON public.daily_activity FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily activity"
    ON public.daily_activity FOR DELETE
    USING (auth.uid() = user_id);

-- ----------------------------------------------------
-- 4. DAILY CHALLENGES TABLE (One Challenge Per Day)
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_date DATE NOT NULL,
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_challenge_date UNIQUE (user_id, challenge_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_user_date ON public.daily_challenges(user_id, challenge_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_problem_id ON public.daily_challenges(problem_id);

DROP TRIGGER IF EXISTS set_daily_challenges_updated_at ON public.daily_challenges;
CREATE TRIGGER set_daily_challenges_updated_at
    BEFORE UPDATE ON public.daily_challenges
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own daily challenges" ON public.daily_challenges;
DROP POLICY IF EXISTS "Users can insert their own daily challenges" ON public.daily_challenges;
DROP POLICY IF EXISTS "Users can update their own daily challenges" ON public.daily_challenges;
DROP POLICY IF EXISTS "Users can delete their own daily challenges" ON public.daily_challenges;

CREATE POLICY "Users can view their own daily challenges"
    ON public.daily_challenges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily challenges"
    ON public.daily_challenges FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily challenges"
    ON public.daily_challenges FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily challenges"
    ON public.daily_challenges FOR DELETE
    USING (auth.uid() = user_id);
