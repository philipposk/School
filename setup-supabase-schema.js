#!/usr/bin/env node
/**
 * Supabase Database Schema Setup Script
 * This script sets up all required tables and RLS policies in Supabase
 */

const SUPABASE_URL = 'https://jmjezmfhygvazfunuujt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptamV6bWZoeWd2YXpmdW51dWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNDczODUsImV4cCI6MjA4MDYyMzM4NX0.dG9FxpOE8t1dcAkXCBxTQiiEKlfRvKTszuOoJ_PVOM4';

// SQL Schema
const SQL_SCHEMA = `
-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  name TEXT,
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

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
`;

async function setupSchema() {
    console.log('🚀 Setting up Supabase database schema...\n');
    
    // Use service role key if available, otherwise use anon key (limited)
    const apiKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
    
    if (!SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('⚠️  Using anon key - some operations may fail. Set SUPABASE_SERVICE_ROLE_KEY for full access.\n');
    }
    
    try {
        // Execute SQL via Supabase REST API
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey,
                'Authorization': `Bearer ${apiKey}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                sql: SQL_SCHEMA
            })
        });
        
        if (!response.ok) {
            // Try alternative: direct SQL endpoint
            const sqlResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': apiKey,
                    'Authorization': `Bearer ${apiKey}`
                },
                body: SQL_SCHEMA
            });
            
            if (!sqlResponse.ok) {
                throw new Error(`API Error: ${sqlResponse.status} ${sqlResponse.statusText}`);
            }
        }
        
        console.log('✅ Database schema setup complete!');
        console.log('\n📋 Created tables:');
        console.log('  - profiles');
        console.log('  - user_progress');
        console.log('  - quiz_scores');
        console.log('  - conversations');
        console.log('  - messages');
        console.log('  - friends');
        console.log('  - assignments');
        console.log('\n🔒 RLS policies enabled and configured');
        console.log('🔄 Auto-profile creation trigger set up');
        
    } catch (error) {
        console.error('❌ Error setting up schema:', error.message);
        console.log('\n💡 Alternative: Run the SQL manually in Supabase Dashboard → SQL Editor');
        console.log('   SQL file: supabase-setup.md (lines 26-164)');
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    setupSchema();
}

module.exports = { setupSchema, SQL_SCHEMA };

