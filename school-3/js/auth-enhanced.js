// Enhanced Authentication System
// Supports: Email/Password (requires verification), Google/Facebook/Apple OAuth (no verification needed)
// Note: OAuth providers already verify emails, so no additional verification required

const AuthManager = {
    // Email confirmation codes storage
    confirmationCodes: JSON.parse(localStorage.getItem('confirmationCodes') || '{}'),
    
    // Generate 6-digit confirmation code
    generateConfirmationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },
    
    // Send confirmation code via email
    async sendConfirmationCode(email, code) {
        const backendUrl = localStorage.getItem('backend_url') || 'https://school-backend.fly.dev';
        if (!backendUrl) {
            console.warn('Backend not configured. Cannot send confirmation code.');
            return false;
        }
        
        try {
            const response = await fetch(`${backendUrl}/api/notifications/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: email,
                    subject: 'Verify Your Email - School Platform',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .code-box { background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 8px; }
                                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>🎓 Verify Your Email</h1>
                                <p>Thank you for signing up! Please use the code below to verify your email address:</p>
                                <div class="code-box">${code}</div>
                                <p>This code will expire in 10 minutes.</p>
                                <p>If you didn't sign up for this account, please ignore this email.</p>
                            </div>
                        </body>
                        </html>
                    `,
                    text: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`
                })
            });
            
            return response.ok;
        } catch (error) {
            console.error('Error sending confirmation code:', error);
            return false;
        }
    },
    
    // Sign up with email and password (REQUIRES email confirmation)
    // Note: OAuth providers (Google, Facebook, Apple) skip this - they're already verified
    async signUpWithEmail(email, password, name) {
        // Validate inputs
        if (!SecurityUtils.validateEmail(email)) {
            throw new Error('Invalid email address');
        }
        
        if (!password || password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }
        
        if (!name || name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters');
        }
        
        // Email/password signup REQUIRES email verification
        // Generate confirmation code
        const code = this.generateConfirmationCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry
        
        // Store code
        this.confirmationCodes[email] = {
            code: code,
            expiresAt: expiresAt.toISOString(),
            password: password, // Store temporarily for confirmation
            name: name,
            requiresVerification: true // Mark as requiring verification
        };
        localStorage.setItem('confirmationCodes', JSON.stringify(this.confirmationCodes));
        
        // Send confirmation code
        const sent = await this.sendConfirmationCode(email, code);
        if (!sent) {
            throw new Error('Failed to send confirmation code. Please check your email address.');
        }
        
        return {
            success: true,
            requiresVerification: true, // Email signup requires verification
            message: 'Confirmation code sent to your email. Please check your inbox.',
            email: email
        };
    },
    
    // Verify email with confirmation code
    async verifyEmail(email, code) {
        const stored = this.confirmationCodes[email];
        
        if (!stored) {
            throw new Error('No confirmation code found for this email. Please sign up again.');
        }
        
        if (new Date(stored.expiresAt) < new Date()) {
            delete this.confirmationCodes[email];
            localStorage.setItem('confirmationCodes', JSON.stringify(this.confirmationCodes));
            throw new Error('Confirmation code has expired. Please sign up again.');
        }
        
        if (stored.code !== code) {
            throw new Error('Invalid confirmation code. Please try again.');
        }
        
        // Code is valid - create account
        // Only email/password signups go through this verification flow
        try {
            // Try Supabase first if configured
            const supabaseUrl = localStorage.getItem('supabase_url');
            const supabaseKey = localStorage.getItem('supabase_anon_key');
            
            if (supabaseUrl && supabaseKey && typeof SupabaseManager !== 'undefined') {
                const { data, error } = await SupabaseManager.signUp(
                    email,
                    stored.password,
                    stored.name
                );
                
                if (error) throw error;
                
                // Clean up confirmation code
                delete this.confirmationCodes[email];
                localStorage.setItem('confirmationCodes', JSON.stringify(this.confirmationCodes));
                
                return {
                    success: true,
                    user: data.user,
                    verified: true,
                    authMethod: 'email', // Track auth method
                    message: 'Email verified! Account created successfully.'
                };
            } else {
                // Fallback to localStorage (for development)
                const user = {
                    email: email,
                    name: stored.name,
                    verified: true,
                    authMethod: 'email', // Track auth method
                    createdAt: new Date().toISOString()
                };
                
                localStorage.setItem('user', JSON.stringify(user));
                
                // Clean up confirmation code
                delete this.confirmationCodes[email];
                localStorage.setItem('confirmationCodes', JSON.stringify(this.confirmationCodes));
                
                return {
                    success: true,
                    user: user,
                    verified: true,
                    authMethod: 'email',
                    message: 'Email verified! Account created successfully.'
                };
            }
        } catch (error) {
            throw new Error(`Account creation failed: ${error.message}`);
        }
    },
    
    // Resend confirmation code
    async resendConfirmationCode(email) {
        const stored = this.confirmationCodes[email];
        if (!stored) {
            throw new Error('No pending signup found. Please sign up again.');
        }
        
        const code = this.generateConfirmationCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        
        stored.code = code;
        stored.expiresAt = expiresAt.toISOString();
        this.confirmationCodes[email] = stored;
        localStorage.setItem('confirmationCodes', JSON.stringify(this.confirmationCodes));
        
        const sent = await this.sendConfirmationCode(email, code);
        if (!sent) {
            throw new Error('Failed to resend confirmation code.');
        }
        
        return { success: true, message: 'Confirmation code resent to your email.' };
    },
    
    // Sign in with Google (OAuth - no email verification needed)
    async signInWithGoogle() {
        const supabaseUrl = localStorage.getItem('supabase_url');
        const supabaseKey = localStorage.getItem('supabase_anon_key');
        
        if (!supabaseUrl || !supabaseKey || typeof SupabaseManager === 'undefined') {
            throw new Error('OAuth sign-in is coming soon. Please use email login for now.');
        }
        
        try {
            const { data, error } = await SupabaseManager.signInWithOAuth('google');
            if (error) throw error;
            
            // OAuth providers already verify email, so no confirmation needed
            // User is automatically logged in after OAuth flow
            return { 
                ...data, 
                verified: true, 
                oauthProvider: 'google',
                skipVerification: true 
            };
        } catch (error) {
            throw new Error(`Google sign in failed: ${error.message}`);
        }
    },
    
    // Sign in with Facebook (OAuth - no email verification needed)
    async signInWithFacebook() {
        const supabaseUrl = localStorage.getItem('supabase_url');
        const supabaseKey = localStorage.getItem('supabase_anon_key');
        
        if (!supabaseUrl || !supabaseKey || typeof SupabaseManager === 'undefined') {
            throw new Error('OAuth sign-in is coming soon. Please use email login for now.');
        }
        
        try {
            const { data, error } = await SupabaseManager.signInWithOAuth('facebook');
            if (error) throw error;
            
            // OAuth providers already verify email, so no confirmation needed
            // User is automatically logged in after OAuth flow
            return { 
                ...data, 
                verified: true, 
                oauthProvider: 'facebook',
                skipVerification: true 
            };
        } catch (error) {
            throw new Error(`Facebook sign in failed: ${error.message}`);
        }
    },
    
    // Sign in with Apple (OAuth - no email verification needed)
    async signInWithApple() {
        const supabaseUrl = localStorage.getItem('supabase_url');
        const supabaseKey = localStorage.getItem('supabase_anon_key');
        
        if (!supabaseUrl || !supabaseKey || typeof SupabaseManager === 'undefined') {
            throw new Error('OAuth sign-in is coming soon. Please use email login for now.');
        }
        
        try {
            const { data, error } = await SupabaseManager.signInWithOAuth('apple');
            if (error) throw error;
            
            // OAuth providers already verify email, so no confirmation needed
            // User is automatically logged in after OAuth flow
            return { 
                ...data, 
                verified: true, 
                oauthProvider: 'apple',
                skipVerification: true 
            };
        } catch (error) {
            throw new Error(`Apple sign in failed: ${error.message}`);
        }
    },
    
    // Sign in with email and password
    async signInWithEmail(email, password) {
        const supabaseUrl = localStorage.getItem('supabase_url');
        const supabaseKey = localStorage.getItem('supabase_anon_key');
        
        if (supabaseUrl && supabaseKey && typeof SupabaseManager !== 'undefined') {
            try {
                const { data, error } = await SupabaseManager.signIn(email, password);
                if (error) throw error;
                return data;
            } catch (error) {
                throw new Error(`Sign in failed: ${error.message}`);
            }
        } else {
            // Fallback to localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user.email === email) {
                    return { user: user };
                }
            }
            throw new Error('Invalid email or password');
        }
    },
    
    // Sign out
    async signOut() {
        const supabaseUrl = localStorage.getItem('supabase_url');
        const supabaseKey = localStorage.getItem('supabase_anon_key');
        
        if (supabaseUrl && supabaseKey && typeof SupabaseManager !== 'undefined') {
            await SupabaseManager.signOut();
        }
        
        localStorage.removeItem('user');
        window.location.reload();
    }
};

window.AuthManager = AuthManager;

