// Onboarding Wizard System
// Guides new users through goal setting and path recommendations

const OnboardingManager = {
    completed: JSON.parse(localStorage.getItem('onboarding_completed') || 'false'),
    userGoals: JSON.parse(localStorage.getItem('user_goals') || '[]'),
    learningPath: JSON.parse(localStorage.getItem('learning_path') || 'null'),
    
    // Check if onboarding needed
    needsOnboarding() {
        return !this.completed;
    },
    
    // Start onboarding
    startOnboarding() {
        this.showOnboardingModal();
    },
    
    // Show onboarding modal
    showOnboardingModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'onboardingModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Welcome to School! 🎓</h2>
                    <p>Let's set up your learning journey</p>
                </div>
                <div class="modal-body" id="onboardingContent">
                    ${this.renderStep1()}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    // Step 1: Goals
    renderStep1() {
        return `
            <div class="onboarding-step">
                <h3>What are your learning goals?</h3>
                <p>Select all that apply:</p>
                <div class="goal-options">
                    <label class="goal-option">
                        <input type="checkbox" value="career" class="goal-checkbox">
                        <span>🚀 Advance my career</span>
                    </label>
                    <label class="goal-option">
                        <input type="checkbox" value="skills" class="goal-checkbox">
                        <span>💼 Learn new skills</span>
                    </label>
                    <label class="goal-option">
                        <input type="checkbox" value="certificate" class="goal-checkbox">
                        <span>📜 Earn certificates</span>
                    </label>
                    <label class="goal-option">
                        <input type="checkbox" value="personal" class="goal-checkbox">
                        <span>🎯 Personal growth</span>
                    </label>
                    <label class="goal-option">
                        <input type="checkbox" value="switch" class="goal-checkbox">
                        <span>🔄 Career switch</span>
                    </label>
                </div>
                <button class="btn btn-primary" onclick="OnboardingManager.nextStep(1)">Next</button>
            </div>
        `;
    },
    
    // Step 2: Experience level
    renderStep2() {
        return `
            <div class="onboarding-step">
                <h3>What's your experience level?</h3>
                <div class="experience-options">
                    <label class="experience-option">
                        <input type="radio" name="experience" value="beginner">
                        <span>🌱 Beginner - Just starting out</span>
                    </label>
                    <label class="experience-option">
                        <input type="radio" name="experience" value="intermediate">
                        <span>📚 Intermediate - Some experience</span>
                    </label>
                    <label class="experience-option">
                        <input type="radio" name="experience" value="advanced">
                        <span>🎓 Advanced - Looking to master</span>
                    </label>
                </div>
                <button class="btn btn-secondary" onclick="OnboardingManager.prevStep()">Back</button>
                <button class="btn btn-primary" onclick="OnboardingManager.nextStep(2)">Next</button>
            </div>
        `;
    },
    
    // Step 3: Interests
    renderStep3() {
        return `
            <div class="onboarding-step">
                <h3>What interests you most?</h3>
                <p>Select your top interests:</p>
                <div class="interest-options">
                    <label class="interest-option">
                        <input type="checkbox" value="webdev" class="interest-checkbox">
                        <span>💻 Web Development</span>
                    </label>
                    <label class="interest-option">
                        <input type="checkbox" value="ios" class="interest-checkbox">
                        <span>📱 iOS Development</span>
                    </label>
                    <label class="interest-option">
                        <input type="checkbox" value="finance" class="interest-checkbox">
                        <span>💰 Finance</span>
                    </label>
                    <label class="interest-option">
                        <input type="checkbox" value="thinking" class="interest-checkbox">
                        <span>🧠 Critical Thinking</span>
                    </label>
                    <label class="interest-option">
                        <input type="checkbox" value="logic" class="interest-checkbox">
                        <span>🔢 Logic</span>
                    </label>
                </div>
                <button class="btn btn-secondary" onclick="OnboardingManager.prevStep()">Back</button>
                <button class="btn btn-primary" onclick="OnboardingManager.nextStep(3)">Next</button>
            </div>
        `;
    },
    
    // Step 4: Time commitment
    renderStep4() {
        return `
            <div class="onboarding-step">
                <h3>How much time can you commit?</h3>
                <div class="time-options">
                    <label class="time-option">
                        <input type="radio" name="time" value="light">
                        <span>⏰ 1-3 hours/week</span>
                    </label>
                    <label class="time-option">
                        <input type="radio" name="time" value="moderate">
                        <span>📅 4-7 hours/week</span>
                    </label>
                    <label class="time-option">
                        <input type="radio" name="time" value="intensive">
                        <span>🔥 8+ hours/week</span>
                    </label>
                </div>
                <button class="btn btn-secondary" onclick="OnboardingManager.prevStep()">Back</button>
                <button class="btn btn-primary" onclick="OnboardingManager.completeOnboarding()">Get Started!</button>
            </div>
        `;
    },
    
    // Navigation
    currentStep: 1,
    
    nextStep(step) {
        // Collect data from current step
        if (step === 1) {
            const goals = Array.from(document.querySelectorAll('.goal-checkbox:checked')).map(cb => cb.value);
            this.userGoals = goals;
        }
        
        this.currentStep = step + 1;
        const content = document.getElementById('onboardingContent');
        
        if (this.currentStep === 2) {
            content.innerHTML = this.renderStep2();
        } else if (this.currentStep === 3) {
            const experience = document.querySelector('input[name="experience"]:checked')?.value;
            this.userGoals.push({ experience });
            content.innerHTML = this.renderStep3();
        } else if (this.currentStep === 4) {
            const interests = Array.from(document.querySelectorAll('.interest-checkbox:checked')).map(cb => cb.value);
            this.userGoals.push({ interests });
            content.innerHTML = this.renderStep4();
        }
    },
    
    prevStep() {
        this.currentStep = Math.max(1, this.currentStep - 1);
        const content = document.getElementById('onboardingContent');
        
        if (this.currentStep === 1) {
            content.innerHTML = this.renderStep1();
        } else if (this.currentStep === 2) {
            content.innerHTML = this.renderStep2();
        } else if (this.currentStep === 3) {
            content.innerHTML = this.renderStep3();
        }
    },
    
    // Complete onboarding and generate learning path
    completeOnboarding() {
        const time = document.querySelector('input[name="time"]:checked')?.value;
        this.userGoals.push({ time });
        
        // Generate learning path based on goals
        this.generateLearningPath();
        
        // Mark as completed
        this.completed = true;
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('user_goals', JSON.stringify(this.userGoals));
        localStorage.setItem('learning_path', JSON.stringify(this.learningPath));
        
        // Close modal
        const modal = document.getElementById('onboardingModal');
        if (modal) modal.remove();
        
        // Show welcome message
        alert('Welcome! Your personalized learning path has been created. Let\'s start learning!');
        
        // Navigate to recommended course
        if (this.learningPath && this.learningPath.recommendedCourse) {
            setTimeout(() => {
                if (typeof showCourse === 'function') {
                    showCourse(this.learningPath.recommendedCourse);
                }
            }, 500);
        }
    },
    
    // Generate personalized learning path
    generateLearningPath() {
        const goals = this.userGoals;
        const interests = goals.find(g => g.interests)?.interests || [];
        const experience = goals.find(g => g.experience)?.experience || 'beginner';
        
        // Recommend courses based on interests
        let recommendedCourse = null;
        
        if (interests.includes('webdev')) {
            recommendedCourse = courses?.find(c => c.id === 'course-webdev')?.id || null;
        } else if (interests.includes('ios')) {
            recommendedCourse = courses?.find(c => c.id === 'course-ios')?.id || null;
        } else if (interests.includes('finance')) {
            recommendedCourse = courses?.find(c => c.id === 'course-finance')?.id || null;
        } else if (interests.includes('thinking')) {
            recommendedCourse = courses?.find(c => c.id === 'course-minds')?.id || null;
        }
        
        // Default to first course if no match
        if (!recommendedCourse && courses && courses.length > 0) {
            recommendedCourse = courses[0].id;
        }
        
        this.learningPath = {
            recommendedCourse: recommendedCourse,
            experience: experience,
            interests: interests,
            createdAt: new Date().toISOString()
        };
    },
    
    // Get recommended path
    getRecommendedPath() {
        return this.learningPath;
    }
};

// Auto-start onboarding for new users
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        if (OnboardingManager.needsOnboarding() && user) {
            setTimeout(() => {
                OnboardingManager.startOnboarding();
            }, 1000);
        }
    });
}

window.OnboardingManager = OnboardingManager;
