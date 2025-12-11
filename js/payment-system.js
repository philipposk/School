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
            stripePriceId: (typeof process !== 'undefined' && process.env && process.env.STRIPE_MONTHLY_PRICE_ID) || 'price_1ScmrNCGeGVZZj1R43zF6LH6', // Monthly price ID
            stripeProductId: 'prod_TZwkitF5vtHLjy', // Product ID
            features: ['All courses', 'AI tutor', 'Certificates', 'Priority support']
        },
        yearly: {
            id: 'yearly',
            name: 'Yearly Premium',
            price: 99.99,
            interval: 'year',
            stripePriceId: (typeof process !== 'undefined' && process.env && process.env.STRIPE_YEARLY_PRICE_ID) || 'price_1ScmsGCGeGVZZj1RkODcyPOf', // Yearly price ID
            stripeProductId: 'prod_TZwlP4UT0spyij', // Product ID
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
    
    // Check if user has active premium subscription
    hasPremiumAccess() {
        const subscription = this.getCurrentSubscription();
        if (!subscription) return false;
        
        if (subscription.plan === 'free') return false;
        
        // Check if subscription is still valid
        if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
            // Subscription expired
            this.updateSubscriptionStatus('expired');
            return false;
        }
        
        return subscription.status === 'active';
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

// Check payment status on page load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        PaymentManager.checkPaymentStatus();
    });
}

window.PaymentManager = PaymentManager;

