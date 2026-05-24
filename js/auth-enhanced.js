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
                // No Supabase configured — refuse to create a phantom account
                // (we can't securely store the password client-side, and a
                // localStorage-only user lets anyone sign in as that email).
                throw new Error('Account creation requires the authentication backend. Please contact the administrator.');
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
    
    // OAuth providers already verify emails — no confirmation flow needed.
    // We rely on SupabaseManager.init() to fetch credentials from the backend
    // /api/config/supabase endpoint, so we don't pre-check localStorage.
    async _signInWithProvider(provider) {
        if (typeof SupabaseManager === 'undefined') {
            throw new Error('Authentication system not loaded. Refresh the page and try again.');
        }
        const client = await SupabaseManager.init();
        if (!client) {
            throw new Error(
                'Authentication backend is not available. ' +
                'Please contact the administrator.'
            );
        }
        try {
            const { data, error } = await SupabaseManager.signInWithOAuth(provider);
            if (error) throw error;
            return {
                ...data,
                verified: true,
                oauthProvider: provider,
                skipVerification: true
            };
        } catch (error) {
            // Surface the underlying Supabase error verbatim so admins can
            // diagnose "provider not enabled" vs "invalid redirect URL" etc.
            throw new Error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign in failed: ${error.message}`);
        }
    },

    async signInWithGoogle()   { return this._signInWithProvider('google'); },
    async signInWithFacebook() { return this._signInWithProvider('facebook'); },
    async signInWithApple()    { return this._signInWithProvider('apple'); },
    
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
        }

        // No Supabase configured: refuse sign-in. The localStorage path can't
        // verify passwords (we never store them), so accepting a known email
        // with any password is a critical bypass. Force real auth instead.
        throw new Error(
            'Sign-in is unavailable: authentication backend is not configured. ' +
            'Please contact the administrator.'
        );
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

