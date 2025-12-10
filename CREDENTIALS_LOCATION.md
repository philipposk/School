# 🔐 Credentials File Location

## Primary Location
**File:** `/Users/phktistakis/Devoloper Projects/School/credentials.json`

## Backup Location
**File:** `/Users/phktistakis/Devoloper Projects/credentials-school.json`

## ⚠️ IMPORTANT SECURITY NOTES

1. **DO NOT COMMIT** `credentials.json` to Git (it's in `.gitignore`)
2. **DO NOT SHARE** this file publicly
3. Keep backups secure and encrypted if possible
4. Rotate keys regularly

## What's Stored

- ✅ **Supabase**: Project URL, Anon Key, Database Password
- ⏳ **AI APIs**: Groq, OpenAI, Anthropic (add when needed)
- ⏳ **Backend**: Backend server URL (add when deployed)
- ⏳ **Other APIs**: Stripe, Email services (add when needed)

## How to Use

### In Browser Console (localhost:8000):
```javascript
// Load credentials from file (you'll need to read the JSON file)
const creds = {
  supabase_url: 'https://jmjezmfhygvazfunuujt.supabase.co',
  supabase_anon_key: 'eyJhbGc...',
  // ... etc
};

// Set them
localStorage.setItem('supabase_url', creds.supabase_url);
localStorage.setItem('supabase_anon_key', creds.supabase_anon_key);
```

### Or use the Settings UI:
1. Open `localhost:8000`
2. Click Settings (⚙️ icon)
3. Enter credentials manually
4. They'll be saved to localStorage

## Last Updated
2025-01-09

