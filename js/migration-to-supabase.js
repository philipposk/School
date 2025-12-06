// Migration script: localStorage → Supabase
// Run this once to migrate existing user data to Supabase

const MigrationManager = {
    async migrateUserData() {
        console.log('🔄 Starting migration from localStorage to Supabase...');
        
        try {
            // Check if Supabase is configured
            if (!localStorage.getItem('supabase_url') || !localStorage.getItem('supabase_anon_key')) {
                console.error('❌ Supabase not configured. Please add credentials in Settings.');
                return false;
            }
            
            // Get current user from localStorage
            const localUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (!localUser.email) {
                console.log('ℹ️ No user data found in localStorage');
                return false;
            }
            
            // Initialize Supabase
            await SupabaseManager.init();
            
            // Check if user exists in Supabase
            const supabaseUser = await SupabaseManager.getCurrentUser();
            if (!supabaseUser) {
                console.log('ℹ️ User not signed in to Supabase. Please sign in first.');
                return false;
            }
            
            // Migrate profile
            console.log('📝 Migrating profile...');
            const profile = {
                name: localUser.name || localUser.email.split('@')[0],
                bio: localUser.bio || '',
                social_links: localUser.socialLinks || {}
            };
            await SupabaseManager.updateProfile(supabaseUser.id, profile);
            
            // Migrate progress
            console.log('📊 Migrating progress...');
            const progress = JSON.parse(localStorage.getItem('progress') || '{}');
            for (const [courseId, courseProgress] of Object.entries(progress)) {
                if (courseProgress.modules) {
                    for (const [moduleId, moduleData] of Object.entries(courseProgress.modules)) {
                        if (moduleData.completed) {
                            await SupabaseManager.saveProgress(
                                supabaseUser.id,
                                courseId,
                                moduleId,
                                true
                            );
                        }
                    }
                }
            }
            
            // Migrate quiz scores
            console.log('📝 Migrating quiz scores...');
            const quizScores = JSON.parse(localStorage.getItem('quizScores') || '{}');
            for (const [courseId, courseQuizzes] of Object.entries(quizScores)) {
                if (courseQuizzes.quizzes) {
                    for (const [quizId, quizData] of Object.entries(courseQuizzes.quizzes)) {
                        if (quizData.score !== undefined) {
                            await SupabaseManager.saveQuizScore(
                                supabaseUser.id,
                                courseId,
                                quizId,
                                quizData.score,
                                quizData.maxScore || 100,
                                quizData.answers || {}
                            );
                        }
                    }
                }
            }
            
            // Migrate friends (if any)
            console.log('👥 Migrating friends...');
            const friends = JSON.parse(localStorage.getItem('friends') || '[]');
            // Note: Friends migration requires friend emails to be converted to user IDs
            // This is a simplified version - you may need to enhance this
            
            console.log('✅ Migration complete!');
            return true;
            
        } catch (error) {
            console.error('❌ Migration error:', error);
            return false;
        }
    },
    
    async migrateMessages() {
        console.log('💬 Migrating messages...');
        
        try {
            const supabaseUser = await SupabaseManager.getCurrentUser();
            if (!supabaseUser) {
                console.log('ℹ️ User not signed in');
                return false;
            }
            
            // Get messages from localStorage
            const messages = JSON.parse(localStorage.getItem('messages') || '{}');
            
            for (const [conversationKey, messageList] of Object.entries(messages)) {
                const [email1, email2] = conversationKey.split('_');
                const otherEmail = email1 === supabaseUser.email ? email2 : email1;
                
                // Get or create conversation
                // Note: This requires the other user's ID, which is complex
                // You may need to enhance this based on your user lookup logic
                
                console.log(`⚠️ Message migration for ${conversationKey} skipped - requires user ID lookup`);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Message migration error:', error);
            return false;
        }
    }
};

window.MigrationManager = MigrationManager;

