-- Safe Supabase Schema Setup (Idempotent - can run multiple times)
-- This script uses IF NOT EXISTS and handles existing objects gracefully

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  name TEXT,
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}',
  is_instructor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add is_instructor and is_admin columns if they don't exist (for existing tables)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'is_instructor'
        ) THEN
            ALTER TABLE public.profiles ADD COLUMN is_instructor BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'is_admin'
        ) THEN
            ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        END IF;
    END IF;
END $$;

-- User progress
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id, module_id)
);

-- Quiz scores
CREATE TABLE IF NOT EXISTS public.quiz_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  answers JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages/conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users ON DELETE CASCADE,
  type TEXT DEFAULT 'friend',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id, type)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Friends/followers
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  friend_id UUID REFERENCES auth.users ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,
  grade INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ
);

-- Course Reviews
CREATE TABLE IF NOT EXISTS public.course_reviews (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Threads
CREATE TABLE IF NOT EXISTS public.forum_threads (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  module_id TEXT,
  title TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT,
  post_count INTEGER DEFAULT 1,
  view_count INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Posts
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  is_answer BOOLEAN DEFAULT FALSE,
  parent_post_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses Table (for instructor-created courses)
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  instructor_id TEXT NOT NULL,
  instructor_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  subtitle TEXT,
  category TEXT DEFAULT 'general',
  price DECIMAL(10, 2) DEFAULT 0,
  is_free BOOLEAN DEFAULT TRUE,
  thumbnail TEXT,
  level TEXT DEFAULT 'Beginner',
  duration TEXT DEFAULT '8 weeks',
  modules INTEGER DEFAULT 8,
  modules_data JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  enrollment_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add approval columns if table already exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'is_approved') THEN
            ALTER TABLE public.courses ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'approval_status') THEN
            ALTER TABLE public.courses ADD COLUMN approval_status TEXT DEFAULT 'pending';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'admin_notes') THEN
            ALTER TABLE public.courses ADD COLUMN admin_notes TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'approved_by') THEN
            ALTER TABLE public.courses ADD COLUMN approved_by TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'approved_at') THEN
            ALTER TABLE public.courses ADD COLUMN approved_at TIMESTAMPTZ;
        END IF;
    END IF;
END $$;

-- Enable Row Level Security (idempotent - safe to run multiple times)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can view own quiz scores" ON public.quiz_scores;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can manage own friends" ON public.friends;
DROP POLICY IF EXISTS "Users can manage own assignments" ON public.assignments;

-- RLS Policies: Users can only see/edit their own data
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz scores" ON public.quiz_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can manage own friends" ON public.friends
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own assignments" ON public.assignments
  FOR ALL USING (auth.uid() = user_id);

-- Course Reviews Policies: Anyone can view, authenticated users can create/update own
DROP POLICY IF EXISTS "Anyone can view course reviews" ON public.course_reviews;
DROP POLICY IF EXISTS "Users can create own reviews" ON public.course_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.course_reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.course_reviews;

CREATE POLICY "Anyone can view course reviews" ON public.course_reviews
  FOR SELECT USING (is_visible = TRUE);

CREATE POLICY "Users can create own reviews" ON public.course_reviews
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own reviews" ON public.course_reviews
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own reviews" ON public.course_reviews
  FOR DELETE USING (auth.uid()::text = user_id);

-- Forum Threads Policies: Anyone can view, authenticated users can create/update own
DROP POLICY IF EXISTS "Anyone can view forum threads" ON public.forum_threads;
DROP POLICY IF EXISTS "Users can create threads" ON public.forum_threads;
DROP POLICY IF EXISTS "Users can update own threads" ON public.forum_threads;
DROP POLICY IF EXISTS "Users can delete own threads" ON public.forum_threads;

CREATE POLICY "Anyone can view forum threads" ON public.forum_threads
  FOR SELECT USING (true);

CREATE POLICY "Users can create threads" ON public.forum_threads
  FOR INSERT WITH CHECK (auth.uid()::text = author_id);

CREATE POLICY "Users can update own threads" ON public.forum_threads
  FOR UPDATE USING (auth.uid()::text = author_id);

CREATE POLICY "Users can delete own threads" ON public.forum_threads
  FOR DELETE USING (auth.uid()::text = author_id);

-- Forum Posts Policies: Anyone can view, authenticated users can create/update own
DROP POLICY IF EXISTS "Anyone can view forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.forum_posts;

CREATE POLICY "Anyone can view forum posts" ON public.forum_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid()::text = author_id);

CREATE POLICY "Users can update own posts" ON public.forum_posts
  FOR UPDATE USING (auth.uid()::text = author_id);

CREATE POLICY "Users can delete own posts" ON public.forum_posts
  FOR DELETE USING (auth.uid()::text = author_id);

-- Courses Policies: Anyone can view published courses, instructors can manage own courses
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can create courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can update own courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can delete own courses" ON public.courses;

CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true OR auth.uid()::text = instructor_id);

CREATE POLICY "Instructors can create courses" ON public.courses
  FOR INSERT WITH CHECK (auth.uid()::text = instructor_id);

CREATE POLICY "Instructors can update own courses" ON public.courses
  FOR UPDATE USING (auth.uid()::text = instructor_id);

CREATE POLICY "Instructors can delete own courses" ON public.courses
  FOR DELETE USING (auth.uid()::text = instructor_id);

-- Admin Actions Log Table
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'approve_course', 'reject_course', 'make_admin', 'make_instructor', etc.
  target_id TEXT, -- course_id, user_id, etc.
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Admin Actions Policies: Only admins can view/create
DROP POLICY IF EXISTS "Admins can view admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Admins can create admin actions" ON public.admin_actions;

CREATE POLICY "Admins can view admin actions" ON public.admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id::text = auth.uid()::text 
      AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can create admin actions" ON public.admin_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id::text = auth.uid()::text 
      AND profiles.is_admin = TRUE
    )
  );

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

