// Security Utilities for School 2
// Input sanitization, validation, and XSS prevention

const SecurityUtils = {
    // Sanitize HTML to prevent XSS
    sanitizeHTML(str) {
        if (!str) return '';
        
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
    
    // Sanitize text (remove HTML tags)
    sanitizeText(str) {
        if (!str) return '';
        return str.replace(/<[^>]*>/g, '').trim();
    },
    
    // Validate URL
    validateURL(url) {
        if (!url) return { valid: true, url: '' }; // Empty URLs are allowed
        
        try {
            const urlObj = new URL(url);
            // Only allow http, https protocols
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
            }
            return { valid: true, url: urlObj.href };
        } catch (e) {
            return { valid: false, error: 'Invalid URL format' };
        }
    },
    
    // Validate email
    validateEmail(email) {
        if (!email) return { valid: false, error: 'Email is required' };
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { valid: false, error: 'Invalid email format' };
        }
        
        // Sanitize email
        const sanitized = this.sanitizeText(email.toLowerCase().trim());
        return { valid: true, email: sanitized };
    },
    
    // Validate name
    validateName(name) {
        if (!name) return { valid: false, error: 'Name is required' };
        
        const sanitized = this.sanitizeText(name.trim());
        
        if (sanitized.length < 2) {
            return { valid: false, error: 'Name must be at least 2 characters' };
        }
        
        if (sanitized.length > 50) {
            return { valid: false, error: 'Name must be less than 50 characters' };
        }
        
        // Only allow letters, spaces, hyphens, apostrophes
        if (!/^[a-zA-Z\s\-']+$/.test(sanitized)) {
            return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
        }
        
        return { valid: true, name: sanitized };
    },
    
    // Validate bio
    validateBio(bio) {
        if (!bio) return { valid: true, bio: '' }; // Bio is optional
        
        const sanitized = this.sanitizeText(bio.trim());
        
        if (sanitized.length > 500) {
            return { valid: false, error: 'Bio must be less than 500 characters' };
        }
        
        return { valid: true, bio: sanitized };
    },
    
    // Escape HTML for safe rendering
    escapeHTML(str) {
        if (!str) return '';
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return str.replace(/[&<>"']/g, m => map[m]);
    },
    
    // Safe render function for user-generated content
    safeRender(str) {
        return this.escapeHTML(str);
    },
    
    // Validate profile picture URL
    validateProfilePicture(url) {
        if (!url) return { valid: true, url: null };
        
        const urlValidation = this.validateURL(url);
        if (!urlValidation.valid) {
            return urlValidation;
        }
        
        // Check if it's an image URL (basic check)
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const lowerUrl = url.toLowerCase();
        const hasImageExtension = imageExtensions.some(ext => lowerUrl.includes(ext));
        
        if (!hasImageExtension && !lowerUrl.includes('imgur') && !lowerUrl.includes('cloudinary')) {
            // Warning but allow it (only in debug mode)
            if (typeof window !== 'undefined' && window.DEBUG_MODE) {
                console.warn('Profile picture URL may not be an image');
            }
        }
        
        return { valid: true, url: urlValidation.url };
    },
    
    // Sanitize all profile data
    sanitizeProfileData(profileData) {
        const sanitized = {};
        
        if (profileData.name) {
            const nameValidation = this.validateName(profileData.name);
            if (!nameValidation.valid) {
                throw new Error(nameValidation.error);
            }
            sanitized.name = nameValidation.name;
        }
        
        if (profileData.email) {
            const emailValidation = this.validateEmail(profileData.email);
            if (!emailValidation.valid) {
                throw new Error(emailValidation.error);
            }
            sanitized.email = emailValidation.email;
        }
        
        if (profileData.bio !== undefined) {
            const bioValidation = this.validateBio(profileData.bio);
            if (!bioValidation.valid) {
                throw new Error(bioValidation.error);
            }
            sanitized.bio = bioValidation.bio;
        }
        
        // Sanitize all URL fields
        const urlFields = ['website', 'linkedin', 'github', 'facebook', 'instagram', 'twitter', 'profilePicture'];
        urlFields.forEach(field => {
            if (profileData[field] !== undefined) {
                if (field === 'profilePicture') {
                    const picValidation = this.validateProfilePicture(profileData[field]);
                    if (!picValidation.valid) {
                        throw new Error(picValidation.error);
                    }
                    sanitized[field] = picValidation.url;
                } else {
                    const urlValidation = this.validateURL(profileData[field]);
                    if (!urlValidation.valid && profileData[field]) {
                        throw new Error(`${field}: ${urlValidation.error}`);
                    }
                    sanitized[field] = urlValidation.url || '';
                }
            }
        });
        
        return sanitized;
    },
    
    // Show error message to user
    showError(message) {
        alert(`Error: ${message}`);
    },
    
    // Show success message
    showSuccess(message) {
        // Could be replaced with a toast notification
        // In production, use proper logging service
        if (typeof window !== 'undefined' && window.DEBUG_MODE) {
            console.log(`Success: ${message}`);
        }
    }
};

// Export for use in other files
window.SecurityUtils = SecurityUtils;

