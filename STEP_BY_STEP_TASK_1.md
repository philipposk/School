# 📝 Task 1: Update Signup/Login UI - Step by Step

## Goal: Add OAuth buttons and email confirmation to login modal

---

## Step 1: Add OAuth Buttons to Login Form

### Where: `index.html` around line 3444

### What to do: Replace the `showLoginForm()` function

**Find this code** (around line 3442):
```javascript
function showLoginForm() {
    const form = document.getElementById('loginForm');
    form.innerHTML = `
        <div class="form-group">
            <label class="form-label">Email or Username</label>
            <input type="text" class="form-input" id="loginEmail" placeholder="Enter your email or username" required autocomplete="username">
        </div>
        <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="loginPassword" placeholder="Enter your password" required autocomplete="current-password">
        </div>
        <div class="btn-group">
            <button type="submit" class="btn btn-primary">Sign In</button>
        </div>
        <p style="text-align: center; margin-top: 1rem; font-size: 0.875rem; color: var(--text-light);">
            Don't have an account? <a href="#" onclick="event.preventDefault(); showSignUpForm();" style="color: var(--theme-primary);">Sign up</a>
        </p>
    `;
```

**Replace with this** (adds OAuth buttons):
```javascript
function showLoginForm() {
    const form = document.getElementById('loginForm');
    form.innerHTML = `
        <div class="form-group">
            <label class="form-label">Email or Username</label>
            <input type="text" class="form-input" id="loginEmail" placeholder="Enter your email or username" required autocomplete="username">
        </div>
        <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="loginPassword" placeholder="Enter your password" required autocomplete="current-password">
        </div>
        <div class="btn-group">
            <button type="submit" class="btn btn-primary">Sign In</button>
        </div>
        
        <!-- OAuth Buttons -->
        <div style="margin: 1.5rem 0; text-align: center;">
            <div style="display: flex; align-items: center; margin: 1rem 0;">
                <div style="flex: 1; height: 1px; background: var(--border);"></div>
                <span style="padding: 0 1rem; color: var(--text-light); font-size: 0.875rem;">or</span>
                <div style="flex: 1; height: 1px; background: var(--border);"></div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <button type="button" class="btn" onclick="handleGoogleSignIn()" style="background: white; color: #333; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <span>🔵</span> Sign in with Google
                </button>
                <button type="button" class="btn" onclick="handleFacebookSignIn()" style="background: #1877F2; color: white; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <span>👥</span> Sign in with Facebook
                </button>
                <button type="button" class="btn" onclick="handleAppleSignIn()" style="background: #000; color: white; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <span>🍎</span> Sign in with Apple
                </button>
            </div>
        </div>
        
        <p style="text-align: center; margin-top: 1rem; font-size: 0.875rem; color: var(--text-light);">
            Don't have an account? <a href="#" onclick="event.preventDefault(); showSignUpForm();" style="color: var(--theme-primary);">Sign up</a>
        </p>
    `;
```

---

## Step 2: Add OAuth Handler Functions

### Where: `index.html` after `showLoginForm()` function (around line 3545)

### What to do: Add these functions right after `showLoginForm()`

**Add this code** (after line 3545, before the closing script tag):
```javascript
        // OAuth Sign In Handlers
        async function handleGoogleSignIn() {
            try {
                if (typeof AuthManager === 'undefined') {
                    alert('Authentication system not loaded. Please refresh the page.');
                    return;
                }
                
                const result = await AuthManager.signInWithGoogle();
                // OAuth redirects, so this may not execute
                console.log('Google sign in initiated');
            } catch (error) {
                console.error('Google sign in error:', error);
                alert(error.message || 'Google sign in failed. Please try again.');
            }
        }

        async function handleFacebookSignIn() {
            try {
                if (typeof AuthManager === 'undefined') {
                    alert('Authentication system not loaded. Please refresh the page.');
                    return;
                }
                
                const result = await AuthManager.signInWithFacebook();
                // OAuth redirects, so this may not execute
                console.log('Facebook sign in initiated');
            } catch (error) {
                console.error('Facebook sign in error:', error);
                alert(error.message || 'Facebook sign in failed. Please try again.');
            }
        }

        async function handleAppleSignIn() {
            try {
                if (typeof AuthManager === 'undefined') {
                    alert('Authentication system not loaded. Please refresh the page.');
                    return;
                }
                
                const result = await AuthManager.signInWithApple();
                // OAuth redirects, so this may not execute
                console.log('Apple sign in initiated');
            } catch (error) {
                console.error('Apple sign in error:', error);
                alert(error.message || 'Apple sign in failed. Please try again.');
            }
        }

        // Make OAuth handlers globally accessible
        window.handleGoogleSignIn = handleGoogleSignIn;
        window.handleFacebookSignIn = handleFacebookSignIn;
        window.handleAppleSignIn = handleAppleSignIn;
```

---

## Step 3: Update Signup Form to Use Email Confirmation

### Where: `index.html` around line 3332

### What to do: Replace the `showSignUpForm()` function

**Find this code** (around line 3332):
```javascript
function showSignUpForm() {
    const form = document.getElementById('loginForm');
    // ... existing code ...
    form.onsubmit = (e) => {
        // ... existing signup logic ...
    };
}
```

**Replace the `form.onsubmit` handler** (around line 3356) with this:

```javascript
            form.onsubmit = async (e) => {
                e.preventDefault();
                const name = document.getElementById('signupName').value.trim();
                const email = document.getElementById('signupEmail').value.trim().toLowerCase();
                const password = document.getElementById('signupPassword').value;
                
                if (password.length < 6) {
                    alert('Password must be at least 6 characters');
                    return;
                }
                
                const emailValidation = SecurityUtils.validateEmail(email);
                if (!emailValidation.valid) {
                    SecurityUtils.showError(emailValidation.error);
                    return;
                }
                
                // Use AuthManager for email confirmation
                if (typeof AuthManager !== 'undefined') {
                    try {
                        const result = await AuthManager.signUpWithEmail(email, password, name);
                        
                        if (result.requiresVerification) {
                            // Show confirmation code input
                            showEmailConfirmationForm(email);
                        } else {
                            // No verification needed (shouldn't happen for email signup)
                            alert('Account created! Please sign in.');
                            showLoginForm();
                        }
                    } catch (error) {
                        console.error('Signup error:', error);
                        alert(error.message || 'Sign up failed. Please try again.');
                    }
                } else {
                    // Fallback to old method if AuthManager not available
                    alert('Authentication system not loaded. Please refresh the page.');
                }
            };
```

---

## Step 4: Add Email Confirmation Form Function

### Where: `index.html` after `showSignUpForm()` function (around line 3440)

### What to do: Add this new function

**Add this code** (right after `showSignUpForm()` function, before `showLoginForm()`):
```javascript
        function showEmailConfirmationForm(email) {
            const form = document.getElementById('loginForm');
            form.innerHTML = `
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <h3 style="margin-bottom: 0.5rem;">📧 Check Your Email</h3>
                    <p style="color: var(--text-light); font-size: 0.875rem;">
                        We sent a 6-digit confirmation code to<br>
                        <strong>${email}</strong>
                    </p>
                </div>
                <div class="form-group">
                    <label class="form-label">Confirmation Code</label>
                    <input type="text" class="form-input" id="confirmationCode" placeholder="Enter 6-digit code" required maxlength="6" style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem; font-weight: bold;">
                </div>
                <div class="btn-group">
                    <button type="button" class="btn btn-secondary" onclick="showSignUpForm()">Back</button>
                    <button type="button" class="btn btn-primary" onclick="verifyEmailCode('${email}')">Verify Email</button>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-size: 0.875rem; color: var(--text-light);">
                    Didn't receive code? <a href="#" onclick="event.preventDefault(); resendConfirmationCode('${email}');" style="color: var(--theme-primary);">Resend</a>
                </p>
            `;
        }

        async function verifyEmailCode(email) {
            const code = document.getElementById('confirmationCode').value.trim();
            
            if (!code || code.length !== 6) {
                alert('Please enter the 6-digit confirmation code');
                return;
            }
            
            if (typeof AuthManager === 'undefined') {
                alert('Authentication system not loaded. Please refresh the page.');
                return;
            }
            
            try {
                const result = await AuthManager.verifyEmail(email, code);
                
                if (result.success) {
                    // Account created and verified
                    user = result.user;
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    if (UserProfileManager && typeof UserProfileManager.initDefaultFriends === 'function') {
                        UserProfileManager.initDefaultFriends();
                    }
                    
                    document.getElementById('loginModal').classList.remove('show');
                    updateUserDisplay();
                    
                    if (state.currentCourseId) {
                        renderCourseView();
                    }
                    
                    alert('✅ Email verified! Account created successfully.');
                }
            } catch (error) {
                console.error('Verification error:', error);
                alert(error.message || 'Verification failed. Please try again.');
            }
        }

        async function resendConfirmationCode(email) {
            if (typeof AuthManager === 'undefined') {
                alert('Authentication system not loaded. Please refresh the page.');
                return;
            }
            
            try {
                const result = await AuthManager.resendConfirmationCode(email);
                alert('✅ Confirmation code resent! Please check your email.');
            } catch (error) {
                console.error('Resend error:', error);
                alert(error.message || 'Failed to resend code. Please try again.');
            }
        }

        // Make functions globally accessible
        window.showEmailConfirmationForm = showEmailConfirmationForm;
        window.verifyEmailCode = verifyEmailCode;
        window.resendConfirmationCode = resendConfirmationCode;
```

---

## ✅ Summary of Changes

1. **Added OAuth buttons** to login form (Google, Facebook, Apple)
2. **Added OAuth handler functions** (handleGoogleSignIn, handleFacebookSignIn, handleAppleSignIn)
3. **Updated signup** to use AuthManager.signUpWithEmail() (requires confirmation)
4. **Added email confirmation form** (shows after signup)
5. **Added verification function** (verifyEmailCode)
6. **Added resend function** (resendConfirmationCode)

---

## 🧪 Test It

1. Open your site: `http://localhost:8001`
2. Click "Sign In"
3. You should see OAuth buttons
4. Click "Sign up"
5. Enter name, email, password
6. Should show confirmation code form
7. Check email for code (if backend configured)

---

## ⚠️ Note

- OAuth buttons will only work after you configure Supabase OAuth (Task 3)
- Email confirmation will only work after you deploy backend (Task 2)
- But the UI is ready! ✅

---

**Next:** Once this is done, move to Task 2: Deploy Backend

