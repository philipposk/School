// Learner Analytics Dashboard
// Tracks time on task, streaks, strengths/gaps, and learning insights

const LearnerAnalytics = {
    sessions: JSON.parse(localStorage.getItem('learning_sessions') || '[]'),
    streaks: JSON.parse(localStorage.getItem('learning_streaks') || '{}'),
    timeTracking: JSON.parse(localStorage.getItem('time_tracking') || '{}'),
    
    // Start learning session
    startSession(courseId, moduleId) {
        const session = {
            id: `session_${Date.now()}`,
            courseId: courseId,
            moduleId: moduleId,
            startTime: Date.now(),
            endTime: null,
            duration: 0
        };
        
        this.sessions.push(session);
        this.saveSessions();
        return session.id;
    },
    
    // End learning session
    endSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;
        
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;
        
        // Update time tracking
        const key = `${session.courseId}_${session.moduleId}`;
        this.timeTracking[key] = (this.timeTracking[key] || 0) + session.duration;
        
        this.saveSessions();
        this.saveTimeTracking();
        
        // Update streak
        this.updateStreak();
        
        return session;
    },
    
    // Update learning streak
    updateStreak() {
        const today = new Date().toDateString();
        const lastStudyDate = this.streaks.lastStudyDate;
        
        if (lastStudyDate === today) {
            // Already studied today
            return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (lastStudyDate === yesterdayStr) {
            // Continue streak
            this.streaks.currentStreak = (this.streaks.currentStreak || 0) + 1;
        } else {
            // New streak
            this.streaks.currentStreak = 1;
        }
        
        this.streaks.lastStudyDate = today;
        this.streaks.longestStreak = Math.max(this.streaks.longestStreak || 0, this.streaks.currentStreak);
        
        this.saveStreaks();
    },
    
    // Get dashboard data
    getDashboardData() {
        const totalTime = Object.values(this.timeTracking).reduce((sum, time) => sum + time, 0);
        const totalSessions = this.sessions.length;
        const completedModules = Object.keys(this.timeTracking).length;
        const currentStreak = this.streaks.currentStreak || 0;
        const longestStreak = this.streaks.longestStreak || 0;
        
        // Calculate average session time
        const avgSessionTime = totalSessions > 0 
            ? Math.round(totalTime / totalSessions / 1000 / 60) // minutes
            : 0;
        
        // Get most studied course
        const courseTime = {};
        this.sessions.forEach(session => {
            if (session.duration) {
                courseTime[session.courseId] = (courseTime[session.courseId] || 0) + session.duration;
            }
        });
        
        const mostStudiedCourse = Object.entries(courseTime)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
        
        // Calculate strengths (modules with high quiz scores)
        const strengths = this.calculateStrengths();
        
        // Calculate gaps (modules with low quiz scores or incomplete)
        const gaps = this.calculateGaps();
        
        return {
            totalTime: Math.round(totalTime / 1000 / 60), // minutes
            totalSessions: totalSessions,
            completedModules: completedModules,
            currentStreak: currentStreak,
            longestStreak: longestStreak,
            avgSessionTime: avgSessionTime,
            mostStudiedCourse: mostStudiedCourse,
            strengths: strengths,
            gaps: gaps,
            weeklyActivity: this.getWeeklyActivity(),
            courseProgress: this.getCourseProgress()
        };
    },
    
    // Calculate strengths
    calculateStrengths() {
        if (!state || !state.quizScores) return [];
        
        const strengths = [];
        Object.entries(state.quizScores).forEach(([key, scoreData]) => {
            if (scoreData.score >= scoreData.total * 0.9) { // 90%+
                const [courseId, moduleId] = key.split('-');
                const course = courses?.find(c => c.id === courseId);
                const module = course?.modules_data?.find(m => m.id === moduleId);
                
                if (module) {
                    strengths.push({
                        courseId: courseId,
                        courseTitle: course.title,
                        moduleId: moduleId,
                        moduleTitle: module.title,
                        score: scoreData.score,
                        total: scoreData.total
                    });
                }
            }
        });
        
        return strengths.slice(0, 5); // Top 5
    },
    
    // Calculate gaps
    calculateGaps() {
        const gaps = [];
        
        // Find incomplete modules
        if (courses) {
            courses.forEach(course => {
                if (course.modules_data) {
                    course.modules_data.forEach(module => {
                        const moduleKey = `${course.id}-${module.id}`;
                        const isCompleted = state.completedModules?.includes(moduleKey);
                        const quizScore = state.quizScores?.[moduleKey];
                        
                        if (!isCompleted || (quizScore && quizScore.score < quizScore.total * 0.7)) {
                            gaps.push({
                                courseId: course.id,
                                courseTitle: course.title,
                                moduleId: module.id,
                                moduleTitle: module.title,
                                reason: !isCompleted ? 'Not started' : 'Quiz score below 70%'
                            });
                        }
                    });
                }
            });
        }
        
        return gaps.slice(0, 5); // Top 5
    },
    
    // Get weekly activity
    getWeeklyActivity() {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentSessions = this.sessions.filter(s => s.startTime >= weekAgo);
        
        const activity = {};
        recentSessions.forEach(session => {
            const date = new Date(session.startTime).toDateString();
            activity[date] = (activity[date] || 0) + 1;
        });
        
        return activity;
    },
    
    // Get course progress
    getCourseProgress() {
        if (!courses) return [];
        
        return courses.map(course => {
            const totalModules = course.modules_data?.length || 0;
            const completed = course.modules_data?.filter(m => {
                const key = `${course.id}-${m.id}`;
                return state.completedModules?.includes(key);
            }).length || 0;
            
            return {
                courseId: course.id,
                courseTitle: course.title,
                progress: totalModules > 0 ? Math.round((completed / totalModules) * 100) : 0,
                completed: completed,
                total: totalModules
            };
        });
    },
    
    // Save data
    saveSessions() {
        // Keep last 1000 sessions
        this.sessions = this.sessions.slice(-1000);
        localStorage.setItem('learning_sessions', JSON.stringify(this.sessions));
    },
    
    saveStreaks() {
        localStorage.setItem('learning_streaks', JSON.stringify(this.streaks));
    },
    
    saveTimeTracking() {
        localStorage.setItem('time_tracking', JSON.stringify(this.timeTracking));
    },
    
    // Render dashboard
    renderDashboard() {
        const data = this.getDashboardData();
        
        return `
            <div class="analytics-dashboard">
                <h2>📊 Your Learning Analytics</h2>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-value">${data.totalTime}</div>
                        <div class="stat-label">Minutes Studied</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-value">${data.currentStreak}</div>
                        <div class="stat-label">Day Streak</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-value">${data.completedModules}</div>
                        <div class="stat-label">Modules Completed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📚</div>
                        <div class="stat-value">${data.totalSessions}</div>
                        <div class="stat-label">Study Sessions</div>
                    </div>
                </div>
                
                <div class="analytics-section">
                    <h3>💪 Your Strengths</h3>
                    <div class="strengths-list">
                        ${data.strengths.length > 0 
                            ? data.strengths.map(s => `
                                <div class="strength-item">
                                    <strong>${s.moduleTitle}</strong> (${s.courseTitle})
                                    <span class="score-badge">${Math.round((s.score/s.total)*100)}%</span>
                                </div>
                            `).join('')
                            : '<p>Keep learning to build your strengths!</p>'
                        }
                    </div>
                </div>
                
                <div class="analytics-section">
                    <h3>🎯 Areas to Improve</h3>
                    <div class="gaps-list">
                        ${data.gaps.length > 0
                            ? data.gaps.map(g => `
                                <div class="gap-item">
                                    <strong>${g.moduleTitle}</strong> (${g.courseTitle})
                                    <span class="reason-badge">${g.reason}</span>
                                </div>
                            `).join('')
                            : '<p>Great job! No gaps identified.</p>'
                        }
                    </div>
                </div>
                
                <div class="analytics-section">
                    <h3>📈 Course Progress</h3>
                    <div class="progress-list">
                        ${data.courseProgress.map(cp => `
                            <div class="progress-item">
                                <div class="progress-header">
                                    <strong>${cp.courseTitle}</strong>
                                    <span>${cp.progress}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${cp.progress}%"></div>
                                </div>
                                <div class="progress-details">${cp.completed} of ${cp.total} modules</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
};

window.LearnerAnalytics = LearnerAnalytics;
