// Supabase Client Configuration
// This file initializes Supabase and provides helper functions
// Version: 2.2 - Fixed library loading and ReferenceError issues
console.log('🔧 Supabase Client v2.2 loaded');

// Load Supabase JS library dynamically
let supabaseClient = null;
let supabaseLibPromise = null;

// Helper function to get credentials dynamically (not at file load time)
function getSupabaseCredentials() {
    return {
        url: localStorage.getItem('supabase_url') || '',
        key: localStorage.getItem('supabase_anon_key') || ''
    };
}

// Helper to get Supabase library from window object only (safe - NO direct supabase reference)
function getSupabaseLib() {
    try {
        if (typeof window === 'undefined') return null;
        
        // Check window.supabase first (most common) - SAFE: only checks window property
        if (window.supabase && typeof window.supabase === 'object' && typeof window.supabase.createClient === 'function') {
            return window.supabase;
        }
        
        // Check alternative names - SAFE: only window properties
        if (window.supabaseJs && typeof window.supabaseJs === 'object' && typeof window.supabaseJs.createClient === 'function') {
            return window.supabaseJs;
        }
        
        if (window.Supabase && typeof window.Supabase === 'object' && typeof window.Supabase.createClient === 'function') {
            return window.Supabase;
        }
        
        // NEVER check global 'supabase' directly - causes ReferenceError if not defined
        return null;
    } catch (e) {
        console.error('Error checking for Supabase library:', e);
        return null;
    }
}

// Load Supabase library - returns a promise that resolves to the library
function loadSupabaseLibrary() {
    // Return existing promise if already loading
    if (supabaseLibPromise) {
        return supabaseLibPromise;
    }
    
    // Check if already loaded
    const existingLib = getSupabaseLib();
    if (existingLib) {
        supabaseLibPromise = Promise.resolve(existingLib);
        return supabaseLibPromise;
    }
    
    // Check if script already exists
    const existingScript = document.querySelector('script[data-supabase-loader="true"]');
    if (existingScript) {
        // Script already loading/loaded, wait for it
        supabaseLibPromise = new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds total
            
            const checkSupabase = () => {
                attempts++;
                const lib = getSupabaseLib();
                
                if (lib) {
                    resolve(lib);
                } else if (attempts < maxAttempts) {
                    setTimeout(checkSupabase, 100);
                } else {
                    console.error('❌ Supabase library not available after waiting');
                    resolve(null);
                }
            };
            
            checkSupabase();
        });
        return supabaseLibPromise;
    }
    
    // Load the library
    supabaseLibPromise = new Promise((resolve) => {
        // Try ES module import first (more reliable and modern)
        if (typeof window !== 'undefined' && window.dynamicImportSupported !== false) {
            // Use dynamic import for ES modules
            import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm')
                .then((module) => {
                    // Store module on window for compatibility
                    if (typeof window !== 'undefined') {
                        window.__supabaseModule = module;
                    }
                    resolve(module);
                })
                .catch((error) => {
                    console.warn('ES module import failed, trying UMD:', error);
                    loadUMD(resolve);
                });
        } else {
            // No import support, use UMD
            loadUMD(resolve);
        }
        
        function loadUMD(resolveFn) {
            const script = document.createElement('script');
            script.setAttribute('data-supabase-loader', 'true');
            // Use specific version for stability
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/dist/umd/supabase.min.js';
            script.async = true;
            script.type = 'text/javascript';
            
            script.onload = () => {
                // Wait for library to initialize - check multiple times
                let attempts = 0;
                const maxAttempts = 50;
                
                const checkSupabase = () => {
                    attempts++;
                    const lib = getSupabaseLib();
                    
                    if (lib) {
                        resolveFn(lib);
                    } else if (attempts < maxAttempts) {
                        setTimeout(checkSupabase, 100);
                    } else {
                        console.error('❌ Supabase library loaded but createClient not found after', maxAttempts, 'attempts');
                        console.log('Available window properties:', Object.keys(window).filter(k => k.toLowerCase().includes('supabase')));
                        resolveFn(null);
                    }
                };
                
                // Start checking after a short delay
                setTimeout(checkSupabase, 100);
            };
            
            script.onerror = () => {
                console.error('❌ Failed to load Supabase library from CDN');
                resolveFn(null);
            };
            
            document.head.appendChild(script);
        }
    });
    
    return supabaseLibPromise;
}

async function initSupabase() {
    if (supabaseClient) return supabaseClient;
    
    // Get credentials dynamically each time
    const credentials = getSupabaseCredentials();
    
    if (!credentials.url || !credentials.key) {
        console.warn('Supabase credentials not configured. Set supabase_url and supabase_anon_key in localStorage or Settings.');
        return null;
    }
    
    try {
        // Load the Supabase library
        const lib = await loadSupabaseLibrary();
        
        if (!lib) {
            console.error('❌ Failed to load Supabase library');
            return null;
        }
        
        // Handle ES module vs UMD
        let createClient;
        if (lib.createClient) {
            // ES module
            createClient = lib.createClient;
        } else if (typeof lib === 'object' && lib.default && lib.default.createClient) {
            // ES module with default export
            createClient = lib.default.createClient;
        } else if (typeof lib === 'function') {
            // UMD - lib is the createClient function
            createClient = lib;
        } else {
            console.error('❌ Unable to find createClient in Supabase library');
            return null;
        }
        
        // Create the client
        supabaseClient = createClient(credentials.url, credentials.key);
        console.log('✅ Supabase client created successfully');
        return supabaseClient;
        
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
        return null;
    }
}

// Supabase Manager - handles all database operations
const SupabaseManager = {
    client: null,
    
    async init() {
        this.client = await initSupabase();
        return this.client;
    },
    
    // Authentication
    async signUp(email, password, name) {
        const client = await this.init();
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });
        if (error) throw error;
        return data;
    },
    
    async signIn(email, password) {
        const client = await this.init();
        const { data, error } = await client.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },
    
    async signOut() {
        const client = await this.init();
        const { error } = await client.auth.signOut();
        if (error) throw error;
    },
    
    async signInWithOAuth(provider) {
        const client = await this.init();
        const { data, error } = await client.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
        return data;
    },
    
    async getCurrentUser() {
        const client = await this.init();
        const { data: { user } } = await client.auth.getUser();
        return user;
    },
    
    async getSession() {
        const client = await this.init();
        const { data: { session } } = await client.auth.getSession();
        return session;
    },
    
    // Profile management
    async getProfile(userId) {
        const client = await this.init();
        const { data, error } = await client
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data;
    },
    
    async updateProfile(userId, updates) {
        const client = await this.init();
        const { data, error } = await client
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    // User progress
    async saveProgress(userId, courseId, moduleId, completed = false) {
        const client = await this.init();
        const { data, error } = await client
            .from('user_progress')
            .upsert({
                user_id: userId,
                course_id: courseId,
                module_id: moduleId,
                completed,
                completed_at: completed ? new Date().toISOString() : null,
                progress_percentage: completed ? 100 : 0
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    async getProgress(userId, courseId = null) {
        const client = await this.init();
        let query = client
            .from('user_progress')
            .select('*')
            .eq('user_id', userId);
        
        if (courseId) {
            query = query.eq('course_id', courseId);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
    },
    
    // Quiz scores
    async saveQuizScore(userId, courseId, quizId, score, maxScore, answers = {}) {
        const client = await this.init();
        const { data, error } = await client
            .from('quiz_scores')
            .insert({
                user_id: userId,
                course_id: courseId,
                quiz_id: quizId,
                score,
                max_score: maxScore,
                answers
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    async getQuizScores(userId, courseId = null) {
        const client = await this.init();
        let query = client
            .from('quiz_scores')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false });
        
        if (courseId) {
            query = query.eq('course_id', courseId);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
    },
    
    // Messages
    async getConversations(userId) {
        const client = await this.init();
        const { data, error } = await client
            .from('conversations')
            .select(`
                *,
                user1:profiles!conversations_user1_id_fkey(*),
                user2:profiles!conversations_user2_id_fkey(*)
            `)
            .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
            .order('updated_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    
    async getMessages(conversationId) {
        const client = await this.init();
        const { data, error } = await client
            .from('messages')
            .select(`
                *,
                sender:profiles!messages_sender_id_fkey(*)
            `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data;
    },
    
    async sendMessage(conversationId, senderId, content, type = 'text') {
        const client = await this.init();
        const { data, error } = await client
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                content,
                type
            })
            .select()
            .single();
        if (error) throw error;
        
        // Update conversation timestamp
        await client
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);
        
        return data;
    },
    
    async getOrCreateConversation(user1Id, user2Id, type = 'friend') {
        const client = await this.init();
        
        // Try to find existing conversation
        const { data: existing } = await client
            .from('conversations')
            .select('*')
            .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
            .eq('type', type)
            .single();
        
        if (existing) return existing;
        
        // Create new conversation
        const { data, error } = await client
            .from('conversations')
            .insert({
                user1_id: user1Id,
                user2_id: user2Id,
                type
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },
    
    // Real-time subscriptions
    subscribeToMessages(conversationId, callback) {
        return this.client
            .channel(`messages:${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            }, callback)
            .subscribe();
    },
    
    subscribeToConversations(userId, callback) {
        return this.client
            .channel(`conversations:${userId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'conversations',
                filter: `user1_id=eq.${userId}`
            }, callback)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'conversations',
                filter: `user2_id=eq.${userId}`
            }, callback)
            .subscribe();
    },
    
    // File uploads
    async uploadFile(bucket, path, file) {
        const client = await this.init();
        const { data, error } = await client.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            });
        if (error) throw error;
        return data;
    },
    
    async getPublicUrl(bucket, path) {
        const client = await this.init();
        const { data } = await client.storage
            .from(bucket)
            .getPublicUrl(path);
        return data.publicUrl;
    },
    
    // Friends
    async addFriend(userId, friendId) {
        const client = await this.init();
        const { data, error } = await client
            .from('friends')
            .insert({
                user_id: userId,
                friend_id: friendId,
                status: 'pending'
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    async getFriends(userId) {
        const client = await this.init();
        const { data, error } = await client
            .from('friends')
            .select(`
                *,
                friend:profiles!friends_friend_id_fkey(*)
            `)
            .eq('user_id', userId)
            .eq('status', 'accepted');
        if (error) throw error;
        return data;
    }
};

// Export
window.SupabaseManager = SupabaseManager;

// Auto-initialize when DOM is ready (with error handling)
(function() {
    const safeInit = async () => {
        try {
            await SupabaseManager.init();
        } catch (error) {
            console.warn('Supabase auto-initialization failed (this is OK if credentials are not set):', error.message);
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeInit);
    } else {
        // Small delay to ensure all scripts are loaded
        setTimeout(safeInit, 100);
    }
})();

