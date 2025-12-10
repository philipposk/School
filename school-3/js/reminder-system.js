// Reminder Notification System
// Sends reminders to user's chosen platforms (Email, SMS, Messenger, WhatsApp, etc.)

const ReminderManager = {
    reminders: JSON.parse(localStorage.getItem('reminders') || '[]'),
    userPreferences: JSON.parse(localStorage.getItem('reminderPreferences') || '{}'),
    
    // Reminder types
    ReminderType: {
        MODULE_COMPLETION: 'module_completion',
        QUIZ_REMINDER: 'quiz_reminder',
        COURSE_DEADLINE: 'course_deadline',
        WEEKLY_REVIEW: 'weekly_review',
        DAILY_STUDY: 'daily_study'
    },
    
    // Initialize default preferences
    initPreferences() {
        if (!user || !user.email) return;
        
        const userId = user.email;
        if (!this.userPreferences[userId]) {
            this.userPreferences[userId] = {
                enabled: true,
                platforms: {
                    email: true,
                    sms: false,
                    messenger: false,
                    whatsapp: false,
                    instagram: false,
                    viber: false,
                    telegram: false,
                    discord: false
                },
                frequency: 'daily', // 'daily', 'weekly', 'custom'
                time: '09:00', // Default reminder time
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                reminderTypes: {
                    module_completion: true,
                    quiz_reminder: true,
                    course_deadline: true,
                    weekly_review: false,
                    daily_study: true
                }
            };
            this.savePreferences();
        }
    },
    
    // Save preferences
    savePreferences() {
        localStorage.setItem('reminderPreferences', JSON.stringify(this.userPreferences));
    },
    
    // Get user preferences
    getPreferences() {
        if (!user || !user.email) return null;
        this.initPreferences();
        return this.userPreferences[user.email];
    },
    
    // Update preferences
    updatePreferences(updates) {
        if (!user || !user.email) return;
        const userId = user.email;
        this.initPreferences();
        this.userPreferences[userId] = { ...this.userPreferences[userId], ...updates };
        this.savePreferences();
    },
    
    // Create reminder
    createReminder(type, courseId, moduleId, message, scheduledTime) {
        if (!user || !user.email) return null;
        
        const reminder = {
            id: `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: user.email,
            type: type,
            courseId: courseId,
            moduleId: moduleId,
            message: message,
            scheduledTime: scheduledTime,
            sent: false,
            createdAt: new Date().toISOString()
        };
        
        this.reminders.push(reminder);
        this.saveReminders();
        
        // Schedule reminder
        this.scheduleReminder(reminder);
        
        return reminder;
    },
    
    // Schedule reminder
    scheduleReminder(reminder) {
        const scheduledTime = new Date(reminder.scheduledTime);
        const now = new Date();
        
        if (scheduledTime <= now) {
            // Send immediately if time has passed
            this.sendReminder(reminder);
        } else {
            // Schedule for later
            const delay = scheduledTime.getTime() - now.getTime();
            setTimeout(() => {
                this.sendReminder(reminder);
            }, delay);
        }
    },
    
    // Send reminder to all user's chosen platforms
    async sendReminder(reminder) {
        if (reminder.sent) return;
        
        const preferences = this.getPreferences();
        if (!preferences || !preferences.enabled) return;
        
        const backendUrl = localStorage.getItem('backend_url') || 'https://school-backend.fly.dev';
        if (!backendUrl) {
            console.warn('Backend URL not configured. Reminders will not be sent.');
            return;
        }
        
        const message = reminder.message || this.generateReminderMessage(reminder);
        
        // Prepare notification payload
        const notificationData = {
            message: message,
            subject: this.getReminderSubject(reminder.type)
        };
        
        // Add user contact info based on preferences
        if (preferences.platforms.email && user.email) {
            notificationData.email = user.email;
        }
        
        // Add other platforms if user has configured them
        const userProfile = UserProfileManager?.getProfile(user.email);
        if (userProfile) {
            if (preferences.platforms.sms && userProfile.phone) {
                notificationData.phone = userProfile.phone;
            }
            if (preferences.platforms.messenger && userProfile.messengerId) {
                notificationData.messengerId = userProfile.messengerId;
            }
            if (preferences.platforms.whatsapp && userProfile.whatsappNumber) {
                notificationData.whatsappNumber = userProfile.whatsappNumber;
            }
            if (preferences.platforms.instagram && userProfile.instagramId) {
                notificationData.instagramId = userProfile.instagramId;
            }
            if (preferences.platforms.viber && userProfile.viberId) {
                notificationData.viberId = userProfile.viberId;
            }
            if (preferences.platforms.telegram && userProfile.telegramChatId) {
                notificationData.telegramChatId = userProfile.telegramChatId;
            }
        }
        
        try {
            // Send via backend multi-channel endpoint
            const response = await fetch(`${backendUrl}/api/notifications/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notificationData)
            });
            
            if (response.ok) {
                reminder.sent = true;
                reminder.sentAt = new Date().toISOString();
                this.saveReminders();
                console.log('Reminder sent successfully:', reminder.id);
            } else {
                console.error('Failed to send reminder:', await response.text());
            }
        } catch (error) {
            console.error('Error sending reminder:', error);
        }
    },
    
    // Generate reminder message based on type
    generateReminderMessage(reminder) {
        const course = courses.find(c => c.id === reminder.courseId);
        const courseTitle = course ? course.title : 'your course';
        
        switch (reminder.type) {
            case this.ReminderType.MODULE_COMPLETION:
                return `Don't forget to complete the next module in "${courseTitle}"! Keep up the great learning! 🎓`;
            
            case this.ReminderType.QUIZ_REMINDER:
                return `You have a quiz waiting in "${courseTitle}". Ready to test your knowledge? 📝`;
            
            case this.ReminderType.COURSE_DEADLINE:
                return `Reminder: "${courseTitle}" deadline is approaching. Make sure to complete all modules! ⏰`;
            
            case this.ReminderType.WEEKLY_REVIEW:
                return `Weekly review time! Check your progress in "${courseTitle}" and see how far you've come! 📊`;
            
            case this.ReminderType.DAILY_STUDY:
                return `Time for your daily study session! Continue learning in "${courseTitle}" 📚`;
            
            default:
                return `Reminder: Continue your learning journey in "${courseTitle}"! 🎓`;
        }
    },
    
    // Get reminder subject
    getReminderSubject(type) {
        switch (type) {
            case this.ReminderType.MODULE_COMPLETION:
                return '📚 Module Reminder';
            case this.ReminderType.QUIZ_REMINDER:
                return '📝 Quiz Reminder';
            case this.ReminderType.COURSE_DEADLINE:
                return '⏰ Course Deadline Reminder';
            case this.ReminderType.WEEKLY_REVIEW:
                return '📊 Weekly Review';
            case this.ReminderType.DAILY_STUDY:
                return '📚 Daily Study Reminder';
            default:
                return '🎓 Learning Reminder';
        }
    },
    
    // Check and send scheduled reminders
    checkScheduledReminders() {
        const now = new Date();
        const userReminders = this.reminders.filter(
            r => r.userId === user?.email && !r.sent && new Date(r.scheduledTime) <= now
        );
        
        userReminders.forEach(reminder => {
            this.sendReminder(reminder);
        });
    },
    
    // Create module completion reminder
    createModuleReminder(courseId, moduleId, daysFromNow = 1) {
        const scheduledTime = new Date();
        scheduledTime.setDate(scheduledTime.getDate() + daysFromNow);
        
        const preferences = this.getPreferences();
        if (preferences && preferences.reminderTypes.module_completion) {
            return this.createReminder(
                this.ReminderType.MODULE_COMPLETION,
                courseId,
                moduleId,
                null,
                scheduledTime.toISOString()
            );
        }
        return null;
    },
    
    // Create quiz reminder
    createQuizReminder(courseId, moduleId, hoursFromNow = 24) {
        const scheduledTime = new Date();
        scheduledTime.setHours(scheduledTime.getHours() + hoursFromNow);
        
        const preferences = this.getPreferences();
        if (preferences && preferences.reminderTypes.quiz_reminder) {
            return this.createReminder(
                this.ReminderType.QUIZ_REMINDER,
                courseId,
                moduleId,
                null,
                scheduledTime.toISOString()
            );
        }
        return null;
    },
    
    // Save reminders
    saveReminders() {
        localStorage.setItem('reminders', JSON.stringify(this.reminders));
    },
    
    // Get user's reminders
    getUserReminders() {
        if (!user || !user.email) return [];
        return this.reminders.filter(r => r.userId === user.email);
    },
    
    // Delete reminder
    deleteReminder(reminderId) {
        this.reminders = this.reminders.filter(r => r.id !== reminderId);
        this.saveReminders();
    },
    
    // Start reminder scheduler (check every hour)
    startScheduler() {
        // Check immediately
        this.checkScheduledReminders();
        
        // Then check every hour
        setInterval(() => {
            this.checkScheduledReminders();
        }, 60 * 60 * 1000); // 1 hour
    }
};

// Initialize scheduler when user is logged in
if (typeof user !== 'undefined' && user && user.email) {
    ReminderManager.initPreferences();
    ReminderManager.startScheduler();
}

window.ReminderManager = ReminderManager;

