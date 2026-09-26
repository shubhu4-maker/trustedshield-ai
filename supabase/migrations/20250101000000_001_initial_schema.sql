-- ═══════════════════════════════════════════════════════════════════════════════
-- TrustShield AI — Database Migration: 001_initial_schema.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Create Enums ────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE risk_level_enum AS ENUM ('SAFE', 'SUSPICIOUS', 'DANGEROUS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE scan_category_enum AS ENUM ('PHISHING', 'JOB_SCAM', 'IMPERSONATION', 'FINANCIAL_CRYPTO', 'ECOMMERCE_INVOICE', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ── Profiles Table (Linked to Supabase Auth) ───────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Security Scans Table ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('TEXT', 'URL')),
  original_length INT NOT NULL,
  redacted_content TEXT NOT NULL,
  analyzed_url TEXT,
  risk_score INT NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  risk_level risk_level_enum NOT NULL,
  category scan_category_enum NOT NULL,
  summary TEXT NOT NULL,
  red_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  heuristic_signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  is_ephemeral BOOLEAN NOT NULL DEFAULT FALSE,
  upvotes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Upvotes Tracking Table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.scan_upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(scan_id, user_id)
);

-- ── Indexes for Query Optimization ──────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_is_public ON public.scans(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_scans_risk_level ON public.scans(risk_level);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON public.scans(created_at DESC);

-- ── Profile Creation Trigger on Auth Signup ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Upvote Helper Functions ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_upvote(scan_id_input UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.scans SET upvotes = upvotes + 1 WHERE id = scan_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_upvote(scan_id_input UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.scans SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = scan_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_upvotes ENABLE ROW LEVEL SECURITY;

-- ── Profiles RLS ────────────────────────────────────────────────────────────────

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);
EXCEPTION WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);
EXCEPTION WHEN undefined_table THEN null;
END $$;

-- ── Scans RLS ───────────────────────────────────────────────────────────────────

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public scans are viewable by anyone" ON public.scans;
  CREATE POLICY "Public scans are viewable by anyone" 
    ON public.scans FOR SELECT 
    USING (is_public = TRUE);
EXCEPTION WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own scans" ON public.scans;
  CREATE POLICY "Users can view own scans" 
    ON public.scans FOR SELECT 
    USING (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can create scans (including anonymous)" ON public.scans;
  CREATE POLICY "Anyone can create scans (including anonymous)" 
    ON public.scans FOR INSERT 
    WITH CHECK (
      (auth.uid() IS NULL AND user_id IS NULL) OR 
      (auth.uid() = user_id)
    );
EXCEPTION WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete own scans" ON public.scans;
  CREATE POLICY "Users can delete own scans" 
    ON public.scans FOR DELETE 
    USING (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins have full access to scans" ON public.scans;
  CREATE POLICY "Admins have full access to scans" 
    ON public.scans FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN undefined_table THEN null;
END $$;

-- ── Upvotes RLS ─────────────────────────────────────────────────────────────────

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can view upvotes" ON public.scan_upvotes;
  CREATE POLICY "Authenticated users can view upvotes" 
    ON public.scan_upvotes FOR SELECT 
    TO authenticated USING (true);
EXCEPTION WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can insert upvote" ON public.scan_upvotes;
  CREATE POLICY "Authenticated users can insert upvote" 
    ON public.scan_upvotes FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can remove own upvote" ON public.scan_upvotes;
  CREATE POLICY "Users can remove own upvote" 
    ON public.scan_upvotes FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id);
EXCEPTION WHEN undefined_table THEN null;
END $$;
