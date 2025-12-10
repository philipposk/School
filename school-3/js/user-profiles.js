// User Profile System with Social Links and Friends

const UserProfileManager = {
    profiles: JSON.parse(localStorage.getItem('userProfiles') || '{}'),
    friends: JSON.parse(localStorage.getItem('friends') || '{}'), // Changed to object: { userId: [friendEmails] }
    
    // Initialize default friends (AI Tutor, Course Instructor)
    initDefaultFriends() {
        if (!user || !user.email) return;
        
        const userId = user.email;
        if (!this.friends[userId]) {
            this.friends[userId] = [];
        }
        
        // Add AI Tutor as default friend
        const aiTutorEmail = 'ai_tutor@school2.com';
        if (!this.friends[userId].includes(aiTutorEmail)) {
            this.friends[userId].push(aiTutorEmail);
        }
        
        // Add Course Instructor as default friend
        const instructorEmail = 'instructor@school2.com';
        if (!this.friends[userId].includes(instructorEmail)) {
            this.friends[userId].push(instructorEmail);
        }
        
        // Create profiles for default friends
        if (!this.profiles[aiTutorEmail]) {
            this.profiles[aiTutorEmail] = {
                email: aiTutorEmail,
                name: 'AI Tutor',
                bio: 'Your friendly AI learning assistant. I can help you with course content, modules, quizzes, and your learning progress!',
                profilePicture: null,
                website: '',
                linkedin: '',
                github: '',
                facebook: '',
                instagram: '',
                twitter: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
        
        if (!this.profiles[instructorEmail]) {
            this.profiles[instructorEmail] = {
                email: instructorEmail,
                name: 'Course Instructor',
                bio: 'Your course instructor. I\'m here to help you succeed in your learning journey!',
                profilePicture: null,
                website: '',
                linkedin: '',
                github: '',
                facebook: '',
                instagram: '',
                twitter: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
        
        this.saveFriends();
        this.saveProfiles();
    },
    
    getProfile(userEmail) {
        if (!userEmail) userEmail = user ? user.email : null;
        if (!userEmail) return null;
        
        if (!this.profiles[userEmail]) {
            this.profiles[userEmail] = {
                email: userEmail,
                name: user ? user.name : 'User',
                bio: '',
                profilePicture: null,
                website: '',
                linkedin: '',
                github: '',
                facebook: '',
                instagram: '',
                twitter: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.saveProfiles();
        }
        
        return this.profiles[userEmail];
    },
    
    updateProfile(profileData) {
        if (!user || !user.email) return false;
        
        try {
            // Sanitize and validate all input data
            const sanitized = SecurityUtils.sanitizeProfileData(profileData);
            
            const profile = this.getProfile(user.email);
            Object.assign(profile, sanitized, {
                updatedAt: new Date().toISOString()
            });
            this.saveProfiles();
            return true;
        } catch (error) {
            SecurityUtils.showError(error.message);
            return false;
        }
    },
    
    saveProfiles() {
        localStorage.setItem('userProfiles', JSON.stringify(this.profiles));
    },
    
    saveFriends() {
        localStorage.setItem('friends', JSON.stringify(this.friends));
    },
    
    addFriend(friendEmail) {
        if (!user || !user.email) return false;
        if (friendEmail === user.email) return false;
        
        const userId = user.email;
        if (!this.friends[userId]) {
            this.friends[userId] = [];
        }
        
        if (this.friends[userId].includes(friendEmail)) return false;
        
        this.friends[userId].push(friendEmail);
        this.saveFriends();
        return true;
    },
    
    removeFriend(friendEmail) {
        if (!user || !user.email) return false;
        
        const userId = user.email;
        if (this.friends[userId]) {
            const beforeLength = this.friends[userId].length;
            this.friends[userId] = this.friends[userId].filter(email => email !== friendEmail);
            const afterLength = this.friends[userId].length;
            
            if (beforeLength !== afterLength) {
                this.saveFriends();
                return true; // Successfully removed
            }
        }
        return false; // Friend not found or not removed
    },
    
    isFriend(friendEmail) {
        if (!user || !user.email) return false;
        const userId = user.email;
        return this.friends[userId] ? this.friends[userId].includes(friendEmail) : false;
    },
    
    getFriendsProfiles() {
        if (!user || !user.email) return [];
        const userId = user.email;
        const friendEmails = this.friends[userId] || [];
        return friendEmails.map(email => this.getProfile(email)).filter(p => p);
    },
    
    getFriendsList() {
        if (!user || !user.email) return [];
        const userId = user.email;
        return this.friends[userId] || [];
    },
    
    getAllUsers() {
        // Get all users from localStorage
        const allUsers = [];
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith('user_') || key === 'user') {
                try {
                    const userData = JSON.parse(localStorage.getItem(key));
                    if (userData && userData.email) {
                        allUsers.push(userData.email);
                    }
                } catch (e) {}
            }
        });
        
        // Also check userProfiles
        Object.keys(this.profiles).forEach(email => {
            if (!allUsers.includes(email)) {
                allUsers.push(email);
            }
        });
        
        return [...new Set(allUsers)]; // Remove duplicates
    },
    
    renderProfileModal(profileEmail = null) {
        const profile = this.getProfile(profileEmail);
        if (!profile) return '';
        
        const isOwnProfile = !profileEmail || (user && profile.email === user.email);
        const isFriend = !isOwnProfile && this.isFriend(profile.email);
        const certificates = CertificateManager.getCertificatesForUser(profile.email);
        
        // Sanitize all user-generated content
        const safeName = SecurityUtils.safeRender(profile.name);
        const safeEmail = SecurityUtils.safeRender(profile.email);
        const safeBio = profile.bio ? SecurityUtils.safeRender(profile.bio) : '';
        const safeProfilePicture = profile.profilePicture ? SecurityUtils.validateURL(profile.profilePicture).url : null;
        
        return `
            <div class="profile-view">
                <div class="profile-header">
                    <div class="profile-cover" style="background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary)); height: 150px; border-radius: 12px 12px 0 0;"></div>
                    <div class="profile-info-section">
                        ${isOwnProfile ? `
                            <div class="profile-avatar-large" style="position: relative; cursor: pointer;" onclick="document.getElementById('profilePhotoUpload').click();" title="Click to change profile photo">
                                <input type="file" id="profilePhotoUpload" accept="image/*" style="display: none;" onchange="handleProfilePhotoUpload(event)">
                                ${safeProfilePicture 
                                    ? `<img src="${SecurityUtils.escapeHTML(safeProfilePicture)}" alt="${safeName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid white; margin-top: -60px;" />`
                                    : ''}
                                <div class="avatar-fallback" style="${safeProfilePicture ? 'display: none;' : ''} display: flex; align-items: center; justify-content: center; width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary)); color: white; font-size: 3rem; font-weight: bold; border: 4px solid white; margin-top: -60px;">
                                    ${safeName.charAt(0).toUpperCase()}
                                </div>
                                <div class="avatar-upload-overlay" style="position: absolute; top: 0; left: 0; width: 120px; height: 120px; border-radius: 50%; background: rgba(0, 0, 0, 0.6); display: none; align-items: center; justify-content: center; color: white; font-size: 0.75rem; font-weight: 600; margin-top: -60px; transition: all 0.2s; pointer-events: none;">
                                    📷 Change
                                </div>
                            </div>
                        ` : `
                            <div class="profile-avatar-large">
                                ${safeProfilePicture 
                                    ? `<img src="${SecurityUtils.escapeHTML(safeProfilePicture)}" alt="${safeName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid white; margin-top: -60px;" />`
                                    : ''}
                                <div class="avatar-fallback" style="${safeProfilePicture ? 'display: none;' : ''} display: flex; align-items: center; justify-content: center; width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary)); color: white; font-size: 3rem; font-weight: bold; border: 4px solid white; margin-top: -60px;">
                                    ${safeName.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        `}
                        <div class="profile-name-section">
                            ${isOwnProfile ? `
                                <div class="editable-field" id="nameField" onclick="startEditProfileName()">
                                    <h2 id="nameDisplay" style="margin: 0;">${safeName}</h2>
                                    <span class="edit-icon">✏️</span>
                                </div>
                                <div id="nameEditContainer" style="display: none; margin-bottom: 0.5rem;">
                                    <input type="text" class="inline-input" id="nameInput" value="${safeName}" style="font-size: 1.75rem; font-weight: 600;">
                                    <div class="inline-edit-actions">
                                        <button class="inline-btn inline-btn-save" onclick="saveProfileName()">💾 Save</button>
                                        <button class="inline-btn inline-btn-cancel" onclick="cancelEditProfileName()">✕ Cancel</button>
                                    </div>
                                </div>
                                <div class="editable-field email-field" id="emailField" onclick="startEditProfileEmail()">
                                    <p id="emailDisplay" class="profile-email" style="margin: 0.25rem 0;">${safeEmail}</p>
                                    <span class="edit-icon">✏️</span>
                                </div>
                                <div id="emailEditContainer" style="display: none; margin-bottom: 1rem;">
                                    <input type="email" class="inline-input" id="emailInput" value="${safeEmail}" style="font-size: 1rem;">
                                    <div class="inline-edit-actions">
                                        <button class="inline-btn inline-btn-save" onclick="saveProfileEmail()">💾 Save</button>
                                        <button class="inline-btn inline-btn-cancel" onclick="cancelEditProfileEmail()">✕ Cancel</button>
                                    </div>
                                </div>
                            ` : `
                                <h2>${safeName}</h2>
                                <p class="profile-email">${safeEmail}</p>
                            `}
                            ${safeBio ? `<p class="profile-bio">${safeBio}</p>` : ''}
                        </div>
                        ${!isOwnProfile ? `
                            <div class="profile-actions" style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                                <button class="btn ${isFriend ? 'btn-secondary' : 'btn-primary'}" 
                                        onclick="${isFriend ? `removeFriend('${profile.email}')` : `addFriend('${profile.email}')`}; closeViewProfile();">
                                    ${isFriend ? '✓ Following' : '+ Follow'}
                                </button>
                                <button class="btn btn-primary" 
                                        onclick="messageFriend('${profile.email}'); closeViewProfile();"
                                        style="display: flex; align-items: center; gap: 0.5rem;">
                                    💬 Message
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="profile-content">
                    ${this.renderSocialLinks(profile)}
                    
                    <div class="profile-section">
                        <h3>Certificates (${certificates.length})</h3>
                        ${certificates.length > 0 
                            ? `<div class="certificates-preview">
                                ${certificates.slice(0, 3).map(cert => `
                                    <div class="cert-preview-card" onclick="viewCertificate('${cert.id}')">
                                        <div class="cert-preview-icon">🎓</div>
                                        <div class="cert-preview-info">
                                            <strong>${cert.courseTitle}</strong>
                                            <span>${new Date(cert.issueDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                `).join('')}
                                ${certificates.length > 3 ? `<div class="cert-preview-more">+${certificates.length - 3} more</div>` : ''}
                            </div>`
                            : '<p style="color: var(--text-light);">No certificates yet</p>'}
                    </div>
                </div>
            </div>
        `;
    },
    
    renderSocialLinks(profile) {
        const links = [];
        if (profile.website) {
            const urlValidation = SecurityUtils.validateURL(profile.website);
            if (urlValidation.valid && urlValidation.url) {
                links.push({ icon: '🌐', label: 'Website', url: urlValidation.url });
            }
        }
        if (profile.linkedin) {
            const urlValidation = SecurityUtils.validateURL(profile.linkedin);
            if (urlValidation.valid && urlValidation.url) {
                links.push({ icon: '💼', label: 'LinkedIn', url: urlValidation.url });
            }
        }
        if (profile.github) {
            const urlValidation = SecurityUtils.validateURL(profile.github);
            if (urlValidation.valid && urlValidation.url) {
                links.push({ icon: '💻', label: 'GitHub', url: urlValidation.url });
            }
        }
        if (profile.facebook) {
            const urlValidation = SecurityUtils.validateURL(profile.facebook);
            if (urlValidation.valid && urlValidation.url) {
                links.push({ icon: '👥', label: 'Facebook', url: urlValidation.url });
            }
        }
        if (profile.instagram) {
            const urlValidation = SecurityUtils.validateURL(profile.instagram);
            if (urlValidation.valid && urlValidation.url) {
                links.push({ icon: '📷', label: 'Instagram', url: urlValidation.url });
            }
        }
        if (profile.twitter) {
            const urlValidation = SecurityUtils.validateURL(profile.twitter);
            if (urlValidation.valid && urlValidation.url) {
                links.push({ icon: '🐦', label: 'Twitter', url: urlValidation.url });
            }
        }
        
        if (links.length === 0) return '';
        
        return `
            <div class="profile-section">
                <h3>Connect</h3>
                <div class="social-links">
                    ${links.map(link => `
                        <a href="${SecurityUtils.escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer" class="social-link">
                            <span class="social-icon">${link.icon}</span>
                            <span>${SecurityUtils.safeRender(link.label)}</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    renderEditProfileModal() {
        const profile = this.getProfile();
        if (!profile) return '';
        
        return `
            <div class="profile-edit-form">
                <div class="form-group">
                    <label class="form-label">Profile Picture URL</label>
                    <input type="url" class="form-input" id="profilePictureInput" 
                           value="${profile.profilePicture || ''}" 
                           placeholder="https://example.com/photo.jpg">
                    <small style="color: var(--text-light);">Enter a URL to your profile picture</small>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Bio <span style="color: var(--text-light); font-weight: normal;">(max 500 characters)</span></label>
                    <textarea class="form-input" id="profileBioInput" rows="4" 
                              placeholder="Tell us about yourself..." maxlength="500">${profile.bio || ''}</textarea>
                    <small style="color: var(--text-light);">
                        <span id="bioCharCount">${(profile.bio || '').length}</span>/500 characters
                    </small>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Website</label>
                    <input type="url" class="form-input" id="profileWebsiteInput" 
                           value="${profile.website || ''}" 
                           placeholder="https://yourwebsite.com">
                </div>
                
                <div class="form-group">
                    <label class="form-label">LinkedIn</label>
                    <input type="url" class="form-input" id="profileLinkedInInput" 
                           value="${profile.linkedin || ''}" 
                           placeholder="https://linkedin.com/in/yourprofile">
                </div>
                
                <div class="form-group">
                    <label class="form-label">GitHub</label>
                    <input type="url" class="form-input" id="profileGitHubInput" 
                           value="${profile.github || ''}" 
                           placeholder="https://github.com/yourusername">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Facebook</label>
                    <input type="url" class="form-input" id="profileFacebookInput" 
                           value="${profile.facebook || ''}" 
                           placeholder="https://facebook.com/yourprofile">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Instagram</label>
                    <input type="url" class="form-input" id="profileInstagramInput" 
                           value="${profile.instagram || ''}" 
                           placeholder="https://instagram.com/yourusername">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Twitter</label>
                    <input type="url" class="form-input" id="profileTwitterInput" 
                           value="${profile.twitter || ''}" 
                           placeholder="https://twitter.com/yourusername">
                </div>
                
                <div class="btn-group">
                    <button type="button" class="btn btn-secondary" onclick="closeProfileEditModal()">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="saveProfile()">Save Profile</button>
                </div>
            </div>
        `;
    },
    
    renderFriendsModal() {
        // Only initialize default friends once (on first login), not every time modal is rendered
        // This prevents re-adding friends that were explicitly unfollowed
        if (!localStorage.getItem('defaultFriendsInitialized')) {
            this.initDefaultFriends();
            localStorage.setItem('defaultFriendsInitialized', 'true');
        }
        
        const allUsers = this.getAllUsers();
        const currentFriends = this.getFriendsProfiles();
        
        // Always include AI Tutor and Course Instructor in suggested friends if not already friends
        const defaultFriends = ['ai_tutor@school2.com', 'instructor@school2.com'];
        const suggestedFriends = [
            ...defaultFriends.filter(email => !this.isFriend(email)),
            ...allUsers
                .filter(email => email !== (user ? user.email : null) && !this.isFriend(email) && !defaultFriends.includes(email))
                .slice(0, 8)
        ];
        
        return `
            <div class="friends-view">
                <div class="friends-tabs">
                    <button class="tab-btn active" onclick="showFriendsTab('following')">Following (${currentFriends.length})</button>
                    <button class="tab-btn" onclick="showFriendsTab('discover')">Discover</button>
                </div>
                
                <div id="friendsTabContent">
                    <div id="followingTab" class="tab-content active">
                        ${currentFriends.length > 0 
                            ? `<div class="friends-grid">
                                ${currentFriends.map(profile => `
                                    <div class="friend-card" onclick="closeFriendsModal(); viewUserProfile('${profile.email}');">
                                        <div class="friend-avatar">
                                            ${profile.profilePicture 
                                                ? `<img src="${profile.profilePicture}" alt="${profile.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />`
                                                : ''}
                                            <div class="avatar-fallback" style="${profile.profilePicture ? 'display: none;' : ''} display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary)); color: white; font-size: 1.5rem; font-weight: bold;">
                                                ${profile.name.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <div class="friend-info">
                                            <strong>${profile.name}</strong>
                                            <span>${profile.email}</span>
                                        </div>
                                        <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); if(typeof removeFriend === 'function') { removeFriend('${profile.email}'); } else { UserProfileManager.removeFriend('${profile.email}'); renderFriendsModal(); }">Unfollow</button>
                                    </div>
                                `).join('')}
                            </div>`
                            : '<p style="text-align: center; color: var(--text-light); padding: 2rem;">You\'re not following anyone yet. Check out the Discover tab!</p>'}
                    </div>
                    
                    <div id="discoverTab" class="tab-content">
                        ${suggestedFriends.length > 0
                            ? `<div class="friends-grid">
                                ${suggestedFriends.map(email => {
                                    const profile = this.getProfile(email);
                                    return `
                                        <div class="friend-card" onclick="closeFriendsModal(); viewUserProfile('${email}');">
                                            <div class="friend-avatar">
                                                ${profile.profilePicture 
                                                    ? `<img src="${profile.profilePicture}" alt="${profile.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />`
                                                    : ''}
                                                <div class="avatar-fallback" style="${profile.profilePicture ? 'display: none;' : ''} display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary)); color: white; font-size: 1.5rem; font-weight: bold;">
                                                    ${profile.name.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div class="friend-info">
                                                <strong>${profile.name}</strong>
                                                <span>${profile.email}</span>
                                            </div>
                                            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); addFriend('${email}'); renderFriendsModal();">Follow</button>
                                        </div>
                                    `;
                                }).join('')}
                            </div>`
                            : '<p style="text-align: center; color: var(--text-light); padding: 2rem;">No users to discover yet.</p>'}
                    </div>
                </div>
            </div>
        `;
    }
};

// Global functions
function saveProfile() {
    const profileData = {
        profilePicture: document.getElementById('profilePictureInput').value,
        bio: document.getElementById('profileBioInput').value,
        website: document.getElementById('profileWebsiteInput').value,
        linkedin: document.getElementById('profileLinkedInInput').value,
        github: document.getElementById('profileGitHubInput').value,
        facebook: document.getElementById('profileFacebookInput').value,
        instagram: document.getElementById('profileInstagramInput').value,
        twitter: document.getElementById('profileTwitterInput').value
    };
    
    if (UserProfileManager.updateProfile(profileData)) {
        closeProfileEditModal();
        updateUserDisplay();
        alert('Profile updated successfully!');
    }
}

function addFriend(email) {
    if (UserProfileManager.addFriend(email)) {
        alert('Friend added!');
    }
}

function removeFriend(email) {
    const removed = UserProfileManager.removeFriend(email);
    if (removed) {
        // Refresh the friends modal to show updated list
        setTimeout(() => {
            if (typeof renderFriendsModal === 'function') {
                renderFriendsModal();
            } else if (typeof UserProfileManager !== 'undefined' && UserProfileManager.renderFriendsModal) {
                const friendsContent = document.getElementById('friendsContent');
                if (friendsContent) {
                    friendsContent.innerHTML = UserProfileManager.renderFriendsModal();
                }
            }
        }, 100);
    }
}

function viewUserProfile(email) {
    const modal = document.getElementById('viewProfileModal');
    if (!modal) {
        const modalHTML = `
            <div id="viewProfileModal" class="modal">
                <div class="modal-content" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 class="modal-title">Profile</h2>
                        <button onclick="closeViewProfile()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <div id="viewProfileContent"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    document.getElementById('viewProfileContent').innerHTML = UserProfileManager.renderProfileModal(email);
    document.getElementById('viewProfileModal').classList.add('show');
}

function closeViewProfile() {
    document.getElementById('viewProfileModal').classList.remove('show');
}

function showFriendsTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tab === 'following') {
        document.querySelector('.tab-btn').classList.add('active');
        document.getElementById('followingTab').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('discoverTab').classList.add('active');
    }
}

function renderFriendsModal() {
    const modal = document.getElementById('friendsModal');
    if (modal) {
        document.getElementById('friendsContent').innerHTML = UserProfileManager.renderFriendsModal();
    }
}

// Inline Editing Functions for Profile
function startEditProfileName() {
    const nameField = document.getElementById('nameField');
    const nameEditContainer = document.getElementById('nameEditContainer');
    const nameInput = document.getElementById('nameInput');
    
    if (!nameField || !nameEditContainer) return;
    
    nameField.style.display = 'none';
    nameEditContainer.style.display = 'block';
    nameInput.focus();
    nameInput.select();
    
    nameInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            saveProfileName();
        } else if (e.key === 'Escape') {
            cancelEditProfileName();
        }
    };
}

function cancelEditProfileName() {
    const nameField = document.getElementById('nameField');
    const nameEditContainer = document.getElementById('nameEditContainer');
    const nameInput = document.getElementById('nameInput');
    
    if (!nameField || !nameEditContainer || !user) return;
    
    const profile = UserProfileManager.getProfile();
    nameInput.value = profile.name;
    nameField.style.display = 'inline-flex';
    nameEditContainer.style.display = 'none';
}

function saveProfileName() {
    const nameInput = document.getElementById('nameInput');
    const nameDisplay = document.getElementById('nameDisplay');
    const nameField = document.getElementById('nameField');
    const nameEditContainer = document.getElementById('nameEditContainer');
    
    if (!nameInput || !nameDisplay || !user) return;
    
    const newName = nameInput.value.trim();
    if (!newName) {
        alert('Name cannot be empty');
        return;
    }
    
    try {
        // Sanitize the name
        const sanitizedName = SecurityUtils ? SecurityUtils.safeRender(newName) : newName;
        
        // Update user object
        user.name = sanitizedName;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update profile using the updateProfile method which handles sanitization
        const profileData = { name: sanitizedName };
        if (SecurityUtils && SecurityUtils.sanitizeProfileData) {
            const sanitized = SecurityUtils.sanitizeProfileData(profileData);
            const profile = UserProfileManager.getProfile();
            profile.name = sanitized.name || sanitizedName;
            profile.updatedAt = new Date().toISOString();
            UserProfileManager.saveProfiles();
        } else {
            const profile = UserProfileManager.getProfile();
            profile.name = sanitizedName;
            profile.updatedAt = new Date().toISOString();
            UserProfileManager.saveProfiles();
        }
        
        // Update display
        nameDisplay.textContent = sanitizedName;
        nameField.style.display = 'inline-flex';
        nameEditContainer.style.display = 'none';
        
        // Update header display
        if (typeof updateUserDisplay === 'function') {
            updateUserDisplay();
        }
        
        // Refresh profile modal
        viewUserProfile(user.email);
    } catch (error) {
        if (SecurityUtils && SecurityUtils.showError) {
            SecurityUtils.showError(error.message);
        } else {
            alert('Error updating name: ' + error.message);
        }
    }
}

function startEditProfileEmail() {
    const emailField = document.getElementById('emailField');
    const emailEditContainer = document.getElementById('emailEditContainer');
    const emailInput = document.getElementById('emailInput');
    
    if (!emailField || !emailEditContainer) return;
    
    emailField.style.display = 'none';
    emailEditContainer.style.display = 'block';
    emailInput.focus();
    emailInput.select();
    
    emailInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            saveProfileEmail();
        } else if (e.key === 'Escape') {
            cancelEditProfileEmail();
        }
    };
}

function cancelEditProfileEmail() {
    const emailField = document.getElementById('emailField');
    const emailEditContainer = document.getElementById('emailEditContainer');
    const emailInput = document.getElementById('emailInput');
    
    if (!emailField || !emailEditContainer || !user) return;
    
    emailInput.value = user.email;
    emailField.style.display = 'inline-flex';
    emailEditContainer.style.display = 'none';
}

function saveProfileEmail() {
    const emailInput = document.getElementById('emailInput');
    const emailDisplay = document.getElementById('emailDisplay');
    const emailField = document.getElementById('emailField');
    const emailEditContainer = document.getElementById('emailEditContainer');
    
    if (!emailInput || !emailDisplay || !user) return;
    
    const newEmail = emailInput.value.trim().toLowerCase();
    if (!newEmail || !newEmail.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    try {
        // Sanitize the email
        const sanitizedEmail = SecurityUtils ? SecurityUtils.safeRender(newEmail) : newEmail;
        
        // Check if email already exists (if different from current)
        const allUsers = UserProfileManager.getAllUsers();
        if (sanitizedEmail !== user.email && allUsers.includes(sanitizedEmail)) {
            alert('This email is already registered');
            return;
        }
        
        const oldEmail = user.email;
        user.email = sanitizedEmail;
        
        // Update profile
        const oldProfile = UserProfileManager.profiles[oldEmail];
        if (oldProfile) {
            oldProfile.email = sanitizedEmail;
            UserProfileManager.profiles[sanitizedEmail] = oldProfile;
            delete UserProfileManager.profiles[oldEmail];
        }
        
        // Update friends references
        Object.keys(UserProfileManager.friends).forEach(friendUserId => {
            const friendList = UserProfileManager.friends[friendUserId];
            const index = friendList.indexOf(oldEmail);
            if (index > -1) {
                friendList[index] = sanitizedEmail;
            }
        });
        
        // Update own friends list key
        if (UserProfileManager.friends[oldEmail]) {
            UserProfileManager.friends[sanitizedEmail] = UserProfileManager.friends[oldEmail];
            delete UserProfileManager.friends[oldEmail];
        }
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(user));
        UserProfileManager.saveProfiles();
        UserProfileManager.saveFriends();
        
        // Update display
        emailDisplay.textContent = sanitizedEmail;
        emailField.style.display = 'inline-flex';
        emailEditContainer.style.display = 'none';
        
        // Update header display
        if (typeof updateUserDisplay === 'function') {
            updateUserDisplay();
        }
        
        // Refresh profile modal with new email
        viewUserProfile(sanitizedEmail);
    } catch (error) {
        if (SecurityUtils && SecurityUtils.showError) {
            SecurityUtils.showError(error.message);
        } else {
            alert('Error updating email: ' + error.message);
        }
    }
}

window.saveProfile = saveProfile;
window.addFriend = addFriend;
window.removeFriend = removeFriend;
window.viewUserProfile = viewUserProfile;
window.closeViewProfile = closeViewProfile;
window.showFriendsTab = showFriendsTab;
window.renderFriendsModal = renderFriendsModal;
window.startEditProfileName = startEditProfileName;
window.cancelEditProfileName = cancelEditProfileName;
window.saveProfileName = saveProfileName;
window.startEditProfileEmail = startEditProfileEmail;
window.cancelEditProfileEmail = cancelEditProfileEmail;
window.saveProfileEmail = saveProfileEmail;

// Message friend function - opens chat directly with friend
function messageFriend(friendEmail) {
    if (!user || !user.email) {
        alert('Please sign in to message friends');
        return;
    }
    
    if (typeof MessagingManager === 'undefined') {
        alert('Messaging system not available. Please refresh the page.');
        return;
    }
    
    // Get or create conversation with friend
    const conversation = MessagingManager.getOrCreateConversation(
        friendEmail, 
        MessagingManager.ConversationType.FRIEND
    );
    
    if (!conversation) {
        alert('Unable to create conversation. Please try again.');
        return;
    }
    
    // Open chat directly
    if (typeof openChat === 'function') {
        openChat(conversation.id);
    } else {
        alert('Chat function not available. Please refresh the page.');
    }
}

window.messageFriend = messageFriend;

// Handle profile photo upload from device
function handleProfilePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
    }
    
    // Read file as data URL
    const reader = new FileReader();
    reader.onload = function(e) {
        const dataURL = e.target.result;
        
        // Update profile picture
        if (user && user.email) {
            const profileData = {
                profilePicture: dataURL
            };
            
            if (UserProfileManager.updateProfile(profileData)) {
                // Refresh the profile view
                const currentProfileEmail = document.getElementById('viewProfileContent') 
                    ? (document.querySelector('.profile-view') ? user.email : null)
                    : null;
                
                if (currentProfileEmail && typeof viewUserProfile === 'function') {
                    viewUserProfile(user.email);
                } else {
                    // Update the avatar in the current view
                    const avatarImg = document.querySelector('.profile-avatar-large img');
                    const avatarFallback = document.querySelector('.profile-avatar-large .avatar-fallback');
                    if (avatarImg) {
                        avatarImg.src = dataURL;
                        avatarImg.style.display = 'block';
                        if (avatarFallback) {
                            avatarFallback.style.display = 'none';
                        }
                    } else if (avatarFallback) {
                        // Create img element if it doesn't exist
                        const img = document.createElement('img');
                        img.src = dataURL;
                        img.alt = user.name || 'Profile';
                        img.style.cssText = 'width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid white; margin-top: -60px;';
                        img.onerror = function() {
                            this.style.display = 'none';
                            if (avatarFallback) avatarFallback.style.display = 'flex';
                        };
                        avatarFallback.parentElement.insertBefore(img, avatarFallback);
                        avatarFallback.style.display = 'none';
                    }
                }
                
                // Update header avatar if exists
                if (typeof updateUserDisplay === 'function') {
                    updateUserDisplay();
                }
                
                alert('Profile photo updated successfully!');
            } else {
                alert('Failed to update profile photo. Please try again.');
            }
        }
    };
    
    reader.onerror = function() {
        alert('Error reading file. Please try again.');
    };
    
    reader.readAsDataURL(file);
}

// Setup avatar hover effect after profile is rendered (CSS handles most of it)
function setupAvatarHoverEffect() {
    // The CSS :hover selector should handle the overlay display
    // This function can be used for any additional setup if needed
    const avatarContainer = document.querySelector('.profile-avatar-large[onclick]');
    if (avatarContainer) {
        // Ensure the file input exists
        let fileInput = document.getElementById('profilePhotoUpload');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'profilePhotoUpload';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            fileInput.onchange = handleProfilePhotoUpload;
            document.body.appendChild(fileInput);
        }
    }
}

// Override viewUserProfile to ensure file input is available
const originalViewUserProfile = window.viewUserProfile;
if (originalViewUserProfile) {
    window.viewUserProfile = function(email) {
        originalViewUserProfile(email);
        // Setup file input after profile is rendered
        setTimeout(setupAvatarHoverEffect, 100);
    };
}

window.handleProfilePhotoUpload = handleProfilePhotoUpload;

