// Supabase Client Configuration
// This file initializes Supabase and provides helper functions

// Initialize Supabase client
// Replace these with your actual Supabase credentials
const SUPABASE_URL = localStorage.getItem('supabase_url') || '';
const SUPABASE_ANON_KEY = localStorage.getItem('supabase_anon_key') || '';

// Load Supabase JS library dynamically
let supabaseClient = null;

async function initSupabase() {
    if (supabaseClient) return supabaseClient;
    
    // Check if Supabase is already loaded
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return supabaseClient;
    }
    
    // Load Supabase JS library
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
    script.type = 'module';
    document.head.appendChild(script);
    
    // Wait for Supabase to load
    return new Promise((resolve) => {
        script.onload = () => {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            resolve(supabaseClient);
        };
    });
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

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SupabaseManager.init());
} else {
    SupabaseManager.init();
}

