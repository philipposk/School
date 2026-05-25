-- Phase 1–6 schema additions. Idempotent. Run once in Supabase SQL editor
-- (or via Management API). Service-role bypasses RLS for backend writes.

-- ----------------------------------------------------------------------------
-- Profile extensions: handle, is_admin, total_points (for leaderboard)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='profiles' AND column_name='handle') THEN
    ALTER TABLE public.profiles ADD COLUMN handle TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='profiles' AND column_name='total_points') THEN
    ALTER TABLE public.profiles ADD COLUMN total_points INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='profiles' AND column_name='study_plan') THEN
    ALTER TABLE public.profiles ADD COLUMN study_plan JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='profiles' AND column_name='goals') THEN
    ALTER TABLE public.profiles ADD COLUMN goals JSONB DEFAULT '[]';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- P1.1 Per-lesson comments
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lesson_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_slug TEXT NOT NULL,
  module_n INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  parent_id UUID REFERENCES public.lesson_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS lesson_comments_course_module_idx
  ON public.lesson_comments(course_slug, module_n, created_at DESC);
ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_read_all" ON public.lesson_comments;
CREATE POLICY "comments_read_all" ON public.lesson_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "comments_insert_auth" ON public.lesson_comments;
CREATE POLICY "comments_insert_auth" ON public.lesson_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_update_own" ON public.lesson_comments;
CREATE POLICY "comments_update_own" ON public.lesson_comments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_delete_own" ON public.lesson_comments;
CREATE POLICY "comments_delete_own" ON public.lesson_comments
  FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- P1.2 Verifiable certificates
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  user_email TEXT,
  student_name TEXT NOT NULL,
  course_slug TEXT NOT NULL,
  course_title TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  revoked BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS certificates_user_idx ON public.certificates(user_id);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "certificates_public_read" ON public.certificates;
CREATE POLICY "certificates_public_read" ON public.certificates
  FOR SELECT USING (revoked = FALSE);
-- Writes via service role only.

-- ----------------------------------------------------------------------------
-- P1.3 Notifications
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx
  ON public.notifications(user_id, created_at DESC);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_read_own" ON public.notifications;
CREATE POLICY "notifications_read_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- P1.7 User notes per lesson
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_notes (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  course_slug TEXT NOT NULL,
  module_n INTEGER NOT NULL,
  body TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, course_slug, module_n)
);
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notes_own" ON public.user_notes;
CREATE POLICY "notes_own" ON public.user_notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- P3.2 Flashcards + FSRS review state
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  course_slug TEXT NOT NULL,
  module_n INTEGER,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS flashcards_user_idx ON public.flashcards(user_id);
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "flashcards_own" ON public.flashcards;
CREATE POLICY "flashcards_own" ON public.flashcards
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.flashcard_reviews (
  card_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  stability NUMERIC DEFAULT 1.0,
  difficulty NUMERIC DEFAULT 5.0,
  last_reviewed_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ DEFAULT NOW(),
  reps INTEGER DEFAULT 0,
  lapses INTEGER DEFAULT 0,
  PRIMARY KEY (card_id, user_id)
);
CREATE INDEX IF NOT EXISTS flashcard_reviews_due_idx
  ON public.flashcard_reviews(user_id, due_at);
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "flashcard_reviews_own" ON public.flashcard_reviews;
CREATE POLICY "flashcard_reviews_own" ON public.flashcard_reviews
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- P4.1 Community feed
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  course_slug TEXT,
  title TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  pinned BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS community_posts_recent_idx
  ON public.community_posts(created_at DESC);
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_read_all" ON public.community_posts;
CREATE POLICY "posts_read_all" ON public.community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "posts_write_auth" ON public.community_posts;
CREATE POLICY "posts_write_auth" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_update_own" ON public.community_posts;
CREATE POLICY "posts_update_own" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_delete_own" ON public.community_posts;
CREATE POLICY "posts_delete_own" ON public.community_posts
  FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS post_comments_post_idx
  ON public.post_comments(post_id, created_at);
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_comments_read_all" ON public.post_comments;
CREATE POLICY "post_comments_read_all" ON public.post_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "post_comments_write_auth" ON public.post_comments;
CREATE POLICY "post_comments_write_auth" ON public.post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "post_comments_delete_own" ON public.post_comments;
CREATE POLICY "post_comments_delete_own" ON public.post_comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.post_likes (
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "likes_read_all" ON public.post_likes;
CREATE POLICY "likes_read_all" ON public.post_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "likes_own" ON public.post_likes;
CREATE POLICY "likes_own" ON public.post_likes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trigger to keep like_count + comment_count in sync
CREATE OR REPLACE FUNCTION public.post_counts_trigger() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'post_likes' THEN
      UPDATE public.community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_TABLE_NAME = 'post_comments' THEN
      UPDATE public.community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'post_likes' THEN
      UPDATE public.community_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id;
    ELSIF TG_TABLE_NAME = 'post_comments' THEN
      UPDATE public.community_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS post_likes_count_trg ON public.post_likes;
CREATE TRIGGER post_likes_count_trg
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.post_counts_trigger();

DROP TRIGGER IF EXISTS post_comments_count_trg ON public.post_comments;
CREATE TRIGGER post_comments_count_trg
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.post_counts_trigger();

-- ----------------------------------------------------------------------------
-- P4.3 Streaks + badges
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE
);
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "streaks_read_public" ON public.user_streaks;
CREATE POLICY "streaks_read_public" ON public.user_streaks FOR SELECT USING (true);
DROP POLICY IF EXISTS "streaks_write_own" ON public.user_streaks;
CREATE POLICY "streaks_write_own" ON public.user_streaks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_key)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "badges_read_public" ON public.user_badges;
CREATE POLICY "badges_read_public" ON public.user_badges FOR SELECT USING (true);
DROP POLICY IF EXISTS "badges_write_own" ON public.user_badges;
CREATE POLICY "badges_write_own" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- P5.3 Web push subscriptions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
-- Writes via service role only; users never query this table directly.
