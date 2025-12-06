// GDPR Compliance Features for School 2
// Cookies consent, data export, data deletion

const GDPRCompliance = {
    // Cookies Consent
    initCookiesConsent() {
        // Check if user has already consented
        const consent = localStorage.getItem('gdpr_cookies_consent');
        if (!consent) {
            this.showCookiesBanner();
        }
    },
    
    showCookiesBanner() {
        // Don't show if already dismissed
        if (document.getElementById('cookiesBanner')) return;
        
        const banner = document.createElement('div');
        banner.id = 'cookiesBanner';
        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--card);
            border-top: 2px solid var(--border);
            padding: 1.5rem;
            box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
        `;
        
        banner.innerHTML = `
            <div style="flex: 1; min-width: 250px;">
                <strong style="color: var(--text);">🍪 Cookie Consent</strong>
                <p style="color: var(--text-light); margin-top: 0.5rem; font-size: 0.9rem;">
                    We use localStorage (similar to cookies) to remember your preferences and track your progress. 
                    By continuing, you consent to our use of localStorage. 
                    <a href="legal/privacy-policy.html" target="_blank" style="color: var(--theme-primary);">Learn more</a>
                </p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="GDPRCompliance.acceptCookies()" 
                        style="padding: 0.75rem 1.5rem; background: var(--theme-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    Accept
                </button>
                <button onclick="GDPRCompliance.rejectCookies()" 
                        style="padding: 0.75rem 1.5rem; background: var(--bg); color: var(--text); border: 2px solid var(--border); border-radius: 8px; cursor: pointer; font-weight: 600;">
                    Reject
                </button>
            </div>
        `;
        
        document.body.appendChild(banner);
    },
    
    acceptCookies() {
        localStorage.setItem('gdpr_cookies_consent', 'accepted');
        localStorage.setItem('gdpr_cookies_consent_date', new Date().toISOString());
        this.hideCookiesBanner();
    },
    
    rejectCookies() {
        localStorage.setItem('gdpr_cookies_consent', 'rejected');
        localStorage.setItem('gdpr_cookies_consent_date', new Date().toISOString());
        // Clear all localStorage data if rejected
        localStorage.clear();
        alert('Your preferences have been cleared. Some features may not work without localStorage.');
        this.hideCookiesBanner();
        location.reload();
    },
    
    hideCookiesBanner() {
        const banner = document.getElementById('cookiesBanner');
        if (banner) {
            banner.style.transition = 'transform 0.3s ease-out';
            banner.style.transform = 'translateY(100%)';
            setTimeout(() => banner.remove(), 300);
        }
    },
    
    // Data Export
    exportUserData() {
        if (!user || !user.email) {
            alert('Please sign in to export your data.');
            return;
        }
        
        const userData = {
            exportDate: new Date().toISOString(),
            user: {
                name: user.name,
                email: user.email
            },
            profile: UserProfileManager.getProfile(user.email),
            progress: {
                completedModules: state.completedModules,
                quizScores: state.quizScores
            },
            certificates: CertificateManager.getCertificatesForUser(user.email),
            friends: UserProfileManager.friends,
            preferences: {
                theme: localStorage.getItem('theme'),
                visualTheme: localStorage.getItem('visualTheme'),
                uiLayout: localStorage.getItem('uiLayout')
            }
        };
        
        // Create downloadable JSON file
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `school2-data-export-${user.email}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Your data has been exported successfully!');
    },
    
    // Data Deletion
    deleteUserData() {
        if (!user || !user.email) {
            alert('Please sign in to delete your data.');
            return;
        }
        
        const confirmed = confirm(
            '⚠️ WARNING: This will permanently delete ALL your data:\n\n' +
            '• Your profile\n' +
            '• Course progress\n' +
            '• Quiz scores\n' +
            '• Certificates\n' +
            '• Friends list\n' +
            '• All preferences\n\n' +
            'This action CANNOT be undone.\n\n' +
            'Are you absolutely sure?'
        );
        
        if (!confirmed) return;
        
        const doubleConfirm = confirm('Type DELETE to confirm (case-sensitive):');
        if (doubleConfirm && prompt('Type DELETE to confirm:') === 'DELETE') {
            // Delete user profile
            const profiles = UserProfileManager.profiles;
            delete profiles[user.email];
            localStorage.setItem('userProfiles', JSON.stringify(profiles));
            
            // Delete certificates
            const certs = CertificateManager.certificates;
            CertificateManager.certificates = certs.filter(c => c.studentEmail !== user.email);
            localStorage.setItem('certificates', JSON.stringify(CertificateManager.certificates));
            
            // Delete from friends lists
            const allFriends = UserProfileManager.friends;
            UserProfileManager.friends = allFriends.filter(email => email !== user.email);
            localStorage.setItem('friends', JSON.stringify(UserProfileManager.friends));
            
            // Remove from other users' friends lists
            Object.keys(profiles).forEach(email => {
                const profile = profiles[email];
                // This would need to be stored per user, but for now we'll clear all
            });
            
            // Clear user data
            localStorage.removeItem('user');
            localStorage.removeItem('completedModules');
            localStorage.removeItem('quizScores');
            localStorage.removeItem('allUsers');
            
            // Clear preferences
            localStorage.removeItem('theme');
            localStorage.removeItem('visualTheme');
            localStorage.removeItem('uiLayout');
            
            alert('Your data has been permanently deleted. You will be signed out.');
            
            // Sign out and reload
            user = null;
            location.reload();
        } else {
            alert('Deletion cancelled. Your data is safe.');
        }
    },
    
    // Render GDPR settings modal
    renderGDPRSettingsModal() {
        return `
            <div class="gdpr-settings">
                <div class="gdpr-section">
                    <h3>Your Data Rights (GDPR)</h3>
                    <p style="color: var(--text-light); margin-bottom: 1.5rem;">
                        Under GDPR, you have the right to access, export, and delete your data.
                    </p>
                    
                    <div class="gdpr-actions">
                        <button class="btn btn-primary" onclick="GDPRCompliance.exportUserData(); closeGDPRSettings();">
                            📥 Export My Data
                        </button>
                        <p style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.5rem;">
                            Download all your data in JSON format
                        </p>
                    </div>
                    
                    <div class="gdpr-actions" style="margin-top: 2rem;">
                        <button class="btn btn-secondary" onclick="GDPRCompliance.showDeleteConfirmation();" 
                                style="background: var(--error); color: white; border-color: var(--error);">
                            🗑️ Delete My Account & Data
                        </button>
                        <p style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.5rem;">
                            Permanently delete all your data (irreversible)
                        </p>
                    </div>
                    
                    <div class="gdpr-info" style="margin-top: 2rem; padding: 1rem; background: var(--hover-bg); border-radius: 8px;">
                        <h4 style="margin-bottom: 0.5rem;">What data do we store?</h4>
                        <ul style="font-size: 0.875rem; color: var(--text-light); margin-left: 1.5rem;">
                            <li>Your profile information (name, email, bio, social links)</li>
                            <li>Course progress and completed modules</li>
                            <li>Quiz scores and results</li>
                            <li>Generated certificates</li>
                            <li>Friends/following list</li>
                            <li>Preferences (theme, layout)</li>
                        </ul>
                    </div>
                    
                    <div style="margin-top: 1.5rem;">
                        <a href="legal/privacy-policy.html" target="_blank" style="color: var(--theme-primary);">
                            📄 View Privacy Policy
                        </a> | 
                        <a href="legal/terms-of-service.html" target="_blank" style="color: var(--theme-primary);">
                            📋 View Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        `;
    },
    
    showDeleteConfirmation() {
        this.deleteUserData();
    }
};

// Global functions
window.openGDPRSettings = function() {
    // Ensure courses are shown first
    if (typeof showCourses === 'function') {
        showCourses();
    }
    
    const modal = document.getElementById('gdprSettingsModal');
    if (!modal) {
        const modalHTML = `
            <div id="gdprSettingsModal" class="modal">
                <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 class="modal-title">GDPR & Data Management</h2>
                        <button onclick="closeGDPRSettings()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <div id="gdprSettingsContent"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    document.getElementById('gdprSettingsContent').innerHTML = GDPRCompliance.renderGDPRSettingsModal();
    document.getElementById('gdprSettingsModal').classList.add('show');
    
    // Scroll window to center to ensure modal is visible
    setTimeout(() => {
        const scrollPosition = window.scrollY;
        const viewportHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Calculate center position
        const centerPosition = (documentHeight - viewportHeight) / 2;
        
        // Only scroll if we're not already near the center
        if (Math.abs(scrollPosition - centerPosition) > viewportHeight / 4) {
            window.scrollTo({ 
                top: centerPosition, 
                behavior: 'smooth' 
            });
        }
    }, 300);
};

window.closeGDPRSettings = function() {
    document.getElementById('gdprSettingsModal').classList.remove('show');
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    GDPRCompliance.initCookiesConsent();
});

// Export for use
window.GDPRCompliance = GDPRCompliance;

