// Payment & Subscription System using Stripe
// Handles subscriptions, one-time payments, and subscription management

const PaymentManager = {
    // Subscription plans
    plans: {
        free: {
            id: 'free',
            name: 'Free',
            price: 0,
            interval: null,
            features: ['Access to free courses', 'Basic features']
        },
        monthly: {
            id: 'monthly',
            name: 'Monthly Premium',
            price: 9.99,
            interval: 'month',
            // Backend env (STRIPE_MONTHLY_PRICE_ID on Fly) is authoritative; this
            // is only a fallback the browser sends along for legacy callers.
            stripePriceId: 'price_1Tan4cCGeGVZZj1RqIdKEvWT', // EUR monthly
            stripeProductId: 'prod_UZa1LFPUV6T1wj',
            features: ['All courses', 'AI tutor', 'Certificates', 'Priority support']
        },
        yearly: {
            id: 'yearly',
            name: 'Yearly Premium',
            price: 99.99,
            interval: 'year',
            stripePriceId: 'price_1Tan4dCGeGVZZj1RthBXKyQ9', // EUR yearly
            stripeProductId: 'prod_UZa1VaNb4oQAe3',
            features: ['All courses', 'AI tutor', 'Certificates', 'Priority support', 'Save 17%']
        }
    },
    
    // User subscription data
    subscriptions: JSON.parse(localStorage.getItem('subscriptions') || '{}'),
    
    // Initialize user subscription
    initUserSubscription() {
        if (!user || !user.email) return null;
        
        const userId = user.email;
        if (!this.subscriptions[userId]) {
            this.subscriptions[userId] = {
                plan: 'free',
                status: 'active',
                startDate: new Date().toISOString(),
                endDate: null,
                stripeSubscriptionId: null,
                stripeCustomerId: null
            };
            this.saveSubscriptions();
        }
        
        return this.subscriptions[userId];
    },
    
    // Get current subscription
    getCurrentSubscription() {
        if (!user || !user.email) return null;
        this.initUserSubscription();
        return this.subscriptions[user.email];
    },
    
    // Check if user has active premium subscription.
    // NOTE: this is a UI hint only. Anything that actually unlocks paid value
    // (downloads, premium API calls) MUST re-check on the server. Use
    // refreshPremiumFromServer() to keep this in sync.
    hasPremiumAccess() {
        const subscription = this.getCurrentSubscription();
        if (!subscription) return false;
        if (subscription.plan === 'free') return false;

        if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
            this.updateSubscriptionStatus('expired');
            return false;
        }

        return subscription.status === 'active';
    },

    // Pull authoritative subscription state from backend (Supabase / Stripe).
    // Mutates the local cache so subsequent hasPremiumAccess() calls reflect it.
    async refreshPremiumFromServer() {
        // Always read the latest user from window — never the stale `user`
        // captured at script-load time (the bootstrap re-binds it later).
        const u = (typeof window !== 'undefined' && window.user) || null;
        if (!u || !u.email) return null;
        const backendUrl = localStorage.getItem('backend_url') || 'https://school-backend.fly.dev';
        try {
            const headers = { 'Content-Type': 'application/json' };
            // If Supabase is initialised, attach the access token so the
            // backend can verify the request — this is what locks the
            // endpoint down: anyone can still hit it, but they only get
            // back data for the user that owns the token.
            try {
                if (typeof SupabaseManager !== 'undefined' && SupabaseManager.init) {
                    const client = await SupabaseManager.init();
                    if (client && client.auth) {
                        const { data } = await client.auth.getSession();
                        const token = data?.session?.access_token;
                        if (token) headers['Authorization'] = `Bearer ${token}`;
                    }
                }
            } catch (_) { /* token attach is best-effort */ }

            const url = `${backendUrl}/api/payments/subscription?userId=${encodeURIComponent(u.email)}`;
            const response = await fetch(url, { headers });
            if (!response.ok) return null;
            const data = await response.json();

            const userId = u.email;
            this.subscriptions[userId] = {
                plan: data.plan || 'free',
                status: data.active ? 'active' : (data.status || 'inactive'),
                startDate: this.subscriptions[userId]?.startDate || new Date().toISOString(),
                endDate: data.endDate || null,
                stripeSubscriptionId: data.stripeSubscriptionId || null,
                stripeCustomerId: data.stripeCustomerId || null
            };
            this.saveSubscriptions();
            return this.subscriptions[userId];
        } catch (err) {
            console.warn('refreshPremiumFromServer failed:', err);
            return null;
        }
    },

    // Get subscription status summary for UI/tests
    getSubscriptionStatus() {
        const subscription = this.getCurrentSubscription();
        if (!subscription) {
            return { plan: 'free', status: 'inactive', expiresAt: null };
        }
        return {
            plan: subscription.plan || 'free',
            status: subscription.status || 'inactive',
            expiresAt: subscription.endDate || null
        };
    },
    
    // Create Stripe checkout session
    async createCheckoutSession(planId) {
        const plan = this.plans[planId];
        if (!plan) {
            throw new Error('Invalid plan selected');
        }
        
        if (plan.price === 0) {
            // Free plan - activate immediately
            this.activateFreePlan();
            return { success: true, plan: 'free' };
        }
        
        const backendUrl = localStorage.getItem('backend_url') || 'https://school-backend.fly.dev';
        if (!backendUrl) {
            if (typeof showComingSoon === 'function') {
                showComingSoon('Payments');
                return { success: false, message: 'Payments coming soon' };
            }
            throw new Error('Backend not configured. Payments are coming soon.');
        }
        
        try {
            const response = await fetch(`${backendUrl}/api/payments/create-checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: planId,
                    priceId: plan.stripePriceId,
                    userId: user?.email,
                    successUrl: `${window.location.origin}?payment=success`,
                    cancelUrl: `${window.location.origin}?payment=cancel`
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create checkout session');
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            const message = error && error.message ? error.message : 'Payment setup failed';
            const isConfigIssue = message.toLowerCase().includes('not configured');
            
            if (isConfigIssue && typeof showComingSoon === 'function') {
                showComingSoon('Payments');
                return { success: false, message: 'Payments coming soon' };
            }
            
            throw new Error(`Payment setup failed: ${message}`);
        }
    },
    
    // Activate free plan
    activateFreePlan() {
        if (!user || !user.email) return;
        
        const userId = user.email;
        this.subscriptions[userId] = {
            plan: 'free',
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: null,
            stripeSubscriptionId: null,
            stripeCustomerId: null
        };
        this.saveSubscriptions();
    },
    
    // Update subscription status
    updateSubscriptionStatus(status, planId = null) {
        if (!user || !user.email) return;
        
        const userId = user.email;
        if (!this.subscriptions[userId]) {
            this.initUserSubscription();
        }
        
        this.subscriptions[userId].status = status;
        if (planId) {
            this.subscriptions[userId].plan = planId;
        }
        
        this.saveSubscriptions();
    },
    
    // Cancel subscription
    async cancelSubscription() {
        const subscription = this.getCurrentSubscription();
        if (!subscription || !subscription.stripeSubscriptionId) {
            throw new Error('No active subscription to cancel');
        }
        
        const backendUrl = localStorage.getItem('backend_url') || '';
        if (!backendUrl) {
            throw new Error('Backend not configured');
        }
        
        try {
            const response = await fetch(`${backendUrl}/api/payments/cancel-subscription`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscriptionId: subscription.stripeSubscriptionId,
                    userId: user.email
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to cancel subscription');
            }
            
            // Update local subscription
            this.updateSubscriptionStatus('cancelled');
            
            return { success: true, message: 'Subscription cancelled successfully' };
        } catch (error) {
            throw new Error(`Cancellation failed: ${error.message}`);
        }
    },
    
    // Save subscriptions
    saveSubscriptions() {
        localStorage.setItem('subscriptions', JSON.stringify(this.subscriptions));
    },
    
    // Check payment status from URL
    checkPaymentStatus() {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        
        if (paymentStatus === 'success') {
            // Payment successful - verify with backend
            this.verifyPaymentSuccess();
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (paymentStatus === 'cancel') {
            alert('Payment was cancelled. You can try again anytime.');
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    },
    
    // Verify payment success with backend
    async verifyPaymentSuccess() {
        const backendUrl = localStorage.getItem('backend_url') || '';
        if (!backendUrl) return;
        
        try {
            const response = await fetch(`${backendUrl}/api/payments/verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.email
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.subscription) {
                    // Update local subscription
                    const userId = user.email;
                    this.subscriptions[userId] = {
                        ...this.subscriptions[userId],
                        ...data.subscription,
                        status: 'active'
                    };
                    this.saveSubscriptions();
                    alert('Payment successful! Your subscription is now active.');
                }
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
        }
    }
};

// Auto load-handler removed: app.js owns these two calls so we don't
// double-fire (which produced two "Payment successful" alerts + two POSTs
// to /verify-payment).

window.PaymentManager = PaymentManager;

