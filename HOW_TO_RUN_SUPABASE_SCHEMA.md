# 📋 How to Run Supabase Schema

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor
- Go to: https://supabase.com/dashboard
- Select your project: `school`
- Click **"SQL Editor"** in the left sidebar

### 2. Create New Query
- Click the **"+"** button (top left) OR
- Click **"New query"**

### 3. Copy Schema File
- Open `supabase-schema-safe.sql` from your project
- Select ALL (Cmd+A / Ctrl+A)
- Copy (Cmd+C / Ctrl+C)

### 4. Paste into SQL Editor
- Click in the SQL editor
- Paste (Cmd+V / Ctrl+V)

### 5. Run the Query
- Click the green **"Run"** button
- OR press **Cmd+Enter** (Mac) / **Ctrl+Enter** (Windows)

### 6. Verify Success
- You should see "Success" in the results panel
- No errors should appear

---

## ✅ What This Does

Creates these tables:
- ✅ `profiles` - User profiles
- ✅ `user_progress` - Course progress tracking
- ✅ `quiz_scores` - Quiz results
- ✅ `conversations` - Chat conversations
- ✅ `messages` - Chat messages
- ✅ `friends` - Friend connections
- ✅ `assignments` - Student assignments
- ✅ `course_reviews` - Course reviews & ratings ⭐ **NEW**

Sets up:
- ✅ Row Level Security (RLS)
- ✅ Security policies
- ✅ Auto-profile creation on signup

---

## 🔄 Safe to Run Multiple Times

This script uses `IF NOT EXISTS` and `DROP POLICY IF EXISTS`, so you can run it multiple times safely. It won't break if tables already exist.

---

## ⚠️ If You Get Errors

**Error: "relation already exists"**
- ✅ This is OK - table already exists, script continues

**Error: "policy already exists"**
- ✅ This is OK - policy already exists, script continues

**Error: "permission denied"**
- ❌ Check you're logged in as project owner
- ❌ Check you're using the correct project

---

## 🎯 After Running

1. ✅ Reviews will sync to Supabase
2. ✅ All user data will be stored in database
3. ✅ Security policies will be active

---

**That's it! Just copy, paste, and run.** 🚀

