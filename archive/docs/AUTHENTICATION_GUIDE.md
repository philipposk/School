# 🔐 Authentication Guide - School Platform

## Authentication Methods

### 1. Email/Password Signup ⚠️ **REQUIRES EMAIL VERIFICATION**

When users sign up with email and password, they **MUST verify their email** before account activation:

1. User enters: Name, Email, Password
2. System sends 6-digit confirmation code to email
3. User enters confirmation code
4. Account is created and activated

**Why?** Email/password signups need verification to ensure the email is valid and belongs to the user.

---

### 2. Google OAuth ✅ **NO VERIFICATION NEEDED**

When users sign in with Google:
1. User clicks "Sign in with Google"
2. Redirects to Google OAuth
3. User authorizes
4. Account created/accessed immediately (no verification needed)

**Why?** Google already verifies the email address, so no additional verification is required.

---

### 3. Facebook OAuth ✅ **NO VERIFICATION NEEDED**

When users sign in with Facebook:
1. User clicks "Sign in with Facebook"
2. Redirects to Facebook OAuth
3. User authorizes
4. Account created/accessed immediately (no verification needed)

**Why?** Facebook already verifies the email address, so no additional verification is required.

---

### 4. Apple Sign In ✅ **NO VERIFICATION NEEDED**

When users sign in with Apple:
1. User clicks "Sign in with Apple"
2. Redirects to Apple OAuth
3. User authorizes
4. Account created/accessed immediately (no verification needed)

**Why?** Apple already verifies the email address, so no additional verification is required.

---

## Implementation Details

### Email/Password Flow:
```javascript
// Step 1: Sign up (requires verification)
const result = await AuthManager.signUpWithEmail(email, password, name);
// Returns: { success: true, requiresVerification: true, email: email }

// Step 2: Verify email with code
const verified = await AuthManager.verifyEmail(email, code);
// Returns: { success: true, user: {...}, verified: true }
```

### OAuth Flow (Google/Facebook/Apple):
```javascript
// Single step - no verification needed
const result = await AuthManager.signInWithGoogle();
// or
const result = await AuthManager.signInWithFacebook();
// or
const result = await AuthManager.signInWithApple();
// Returns: { ...data, verified: true, skipVerification: true }
```

---

## User Experience

### Email Signup:
1. Fill form → Submit
2. **See**: "Confirmation code sent to your email"
3. Enter 6-digit code
4. Account activated ✅

### OAuth Signup:
1. Click "Sign in with [Provider]"
2. Authorize on provider's site
3. **Immediately logged in** ✅ (no code needed)

---

## Why This Design?

- **Email/Password**: User provides email, we need to verify they own it
- **OAuth Providers**: Provider already verified the email, so we trust it

This provides:
- ✅ Security (email verification for email signups)
- ✅ Convenience (instant login for OAuth)
- ✅ Best user experience

---

## Setup Required

### Supabase Configuration:
1. **Email/Password**: Enabled by default ✅
2. **Google OAuth**: 
   - Supabase Dashboard → Authentication → Providers
   - Enable Google
   - Add Client ID & Secret
3. **Facebook OAuth**: 
   - Supabase Dashboard → Authentication → Providers
   - Enable Facebook
   - Add App ID & Secret
4. **Apple Sign In**: 
   - Supabase Dashboard → Authentication → Providers
   - Enable Apple
   - Add Service ID & Key

---

**Email verification is ONLY required for email/password signups!** 🎯

