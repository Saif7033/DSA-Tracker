-- Enable UUID generation extension
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

-- Row Level Security (RLS)
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if rerun
DROP POLICY IF EXISTS "Users can view their own problems" ON public.problems;
DROP POLICY IF EXISTS "Users can create their own problems" ON public.problems;
DROP POLICY IF EXISTS "Users can update their own problems" ON public.problems;
DROP POLICY IF EXISTS "Users can delete their own problems" ON public.problems;

-- Row Level Security Policies
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
