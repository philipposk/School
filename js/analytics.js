// Analytics & Tracking System for School Platform
// Google Analytics integration and custom event tracking

const AnalyticsManager = {
    gaId: null,
    initialized: false,
    
    // Initialize Google Analytics
    init(gaTrackingId) {
        if (!gaTrackingId || this.initialized) return;
        
        this.gaId = gaTrackingId;
        
        // Load Google Analytics script
        const script1 = document.createElement('script');
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`;
        document.head.appendChild(script1);
        
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', gaTrackingId, {
            page_path: window.location.pathname,
            send_page_view: true
        });
        
        this.initialized = true;
        console.log('Google Analytics initialized:', gaTrackingId);
    },
    
    // Track page view
    trackPageView(pagePath, pageTitle) {
        if (!this.initialized || !window.gtag) return;
        
        gtag('config', this.gaId, {
            page_path: pagePath || window.location.pathname,
            page_title: pageTitle || document.title
        });
    },
    
    // Track custom event
    trackEvent(eventName, eventParams = {}) {
        if (!this.initialized || !window.gtag) return;
        
        gtag('event', eventName, {
            ...eventParams,
            timestamp: Date.now()
        });
    },
    
    // Track course enrollment
    trackCourseEnrollment(courseId, courseTitle) {
        this.trackEvent('course_enrollment', {
            course_id: courseId,
            course_title: courseTitle,
            user_id: user?.email || 'anonymous'
        });
    },
    
    // Track module completion
    trackModuleCompletion(courseId, moduleId, moduleTitle) {
        this.trackEvent('module_completion', {
            course_id: courseId,
            module_id: moduleId,
            module_title: moduleTitle,
            user_id: user?.email || 'anonymous'
        });
    },
    
    // Track quiz completion
    trackQuizCompletion(courseId, moduleId, score, passed) {
        this.trackEvent('quiz_completion', {
            course_id: courseId,
            module_id: moduleId,
            score: score,
            passed: passed,
            user_id: user?.email || 'anonymous'
        });
    },
    
    // Track certificate earned
    trackCertificateEarned(courseId, courseTitle) {
        this.trackEvent('certificate_earned', {
            course_id: courseId,
            course_title: courseTitle,
            user_id: user?.email || 'anonymous'
        });
    },
    
    // Track search
    trackSearch(query, resultCount) {
        this.trackEvent('search', {
            search_term: query,
            result_count: resultCount
        });
    },
    
    // Track AI tutor interaction
    trackAITutorInteraction(question, responseLength) {
        this.trackEvent('ai_tutor_interaction', {
            question_length: question.length,
            response_length: responseLength
        });
    },
    
    // Track payment initiation
    trackPaymentInitiated(planId, planName, amount) {
        this.trackEvent('payment_initiated', {
            plan_id: planId,
            plan_name: planName,
            amount: amount,
            currency: 'USD'
        });
    },
    
    // Track payment success
    trackPaymentSuccess(planId, planName, amount) {
        this.trackEvent('purchase', {
            transaction_id: `txn_${Date.now()}`,
            value: amount,
            currency: 'USD',
            items: [{
                item_id: planId,
                item_name: planName,
                price: amount,
                quantity: 1
            }]
        });
    },
    
    // Track forum post
    trackForumPost(threadId, postType) {
        this.trackEvent('forum_post', {
            thread_id: threadId,
            post_type: postType // 'thread' or 'reply'
        });
    },
    
    // Track user engagement
    trackEngagement(action, details = {}) {
        this.trackEvent('user_engagement', {
            action: action,
            ...details
        });
    },
    
    // Track time on page
    trackTimeOnPage(pagePath, timeSpent) {
        this.trackEvent('time_on_page', {
            page_path: pagePath,
            time_spent: timeSpent // in seconds
        });
    }
};

// Auto-track page views on navigation
let lastPagePath = window.location.pathname;
let pageStartTime = Date.now();

// Track time on page when leaving
window.addEventListener('beforeunload', () => {
    if (AnalyticsManager.initialized) {
        const timeSpent = Math.floor((Date.now() - pageStartTime) / 1000);
        AnalyticsManager.trackTimeOnPage(lastPagePath, timeSpent);
    }
});

// Track page changes (for SPA navigation)
const originalPushState = history.pushState;
history.pushState = function(...args) {
    if (AnalyticsManager.initialized) {
        const timeSpent = Math.floor((Date.now() - pageStartTime) / 1000);
        AnalyticsManager.trackTimeOnPage(lastPagePath, timeSpent);
    }
    
    originalPushState.apply(history, args);
    
    lastPagePath = window.location.pathname;
    pageStartTime = Date.now();
    
    if (AnalyticsManager.initialized) {
        AnalyticsManager.trackPageView(lastPagePath);
    }
};

window.AnalyticsManager = AnalyticsManager;
