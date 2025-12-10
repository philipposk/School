/**
 * Security Utilities Module
 * 
 * Provides input sanitization, validation, and XSS prevention utilities.
 * All user input should be sanitized before being displayed or stored.
 * 
 * @module SecurityUtils
 */

// Constants
const MAX_NAME_LENGTH = 50;
const MIN_NAME_LENGTH = 2;
const MAX_BIO_LENGTH = 500;
const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const TRUSTED_DOMAINS = ['imgur', 'cloudinary'];

// HTML escape map for XSS prevention
const HTML_ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
};

const SecurityUtils = {
    /**
     * Sanitize HTML to prevent XSS attacks
     * Uses textContent to strip all HTML tags safely
     * 
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeHTML(str) {
        if (!str) return '';
        
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
    
    /**
     * Sanitize text by removing HTML tags
     * 
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string without HTML tags
     */
    sanitizeText(str) {
        if (!str) return '';
        return str.replace(/<[^>]*>/g, '').trim();
    },
    
    /**
     * Validate URL format and protocol
     * Only allows HTTP and HTTPS protocols for security
     * 
     * @param {string} url - URL to validate
     * @returns {Object} Validation result with {valid: boolean, url?: string, error?: string}
     */
    validateURL(url) {
        if (!url) return { valid: true, url: '' }; // Empty URLs are allowed
        
        try {
            const urlObj = new URL(url);
            
            // Only allow http, https protocols
            if (!ALLOWED_PROTOCOLS.includes(urlObj.protocol)) {
                return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
            }
            
            return { valid: true, url: urlObj.href };
        } catch (e) {
            return { valid: false, error: 'Invalid URL format' };
        }
    },
    
    /**
     * Validate email format
     * 
     * @param {string} email - Email to validate
     * @returns {Object} Validation result with {valid: boolean, email?: string, error?: string}
     */
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
    
    /**
     * Validate name format and length
     * 
     * @param {string} name - Name to validate
     * @returns {Object} Validation result with {valid: boolean, name?: string, error?: string}
     */
    validateName(name) {
        if (!name) return { valid: false, error: 'Name is required' };
        
        const sanitized = this.sanitizeText(name.trim());
        
        if (sanitized.length < MIN_NAME_LENGTH) {
            return { valid: false, error: `Name must be at least ${MIN_NAME_LENGTH} characters` };
        }
        
        if (sanitized.length > MAX_NAME_LENGTH) {
            return { valid: false, error: `Name must be less than ${MAX_NAME_LENGTH} characters` };
        }
        
        // Only allow letters, spaces, hyphens, apostrophes
        if (!/^[a-zA-Z\s\-']+$/.test(sanitized)) {
            return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
        }
        
        return { valid: true, name: sanitized };
    },
    
    /**
     * Validate bio length (bio is optional)
     * 
     * @param {string} bio - Bio to validate
     * @returns {Object} Validation result with {valid: boolean, bio?: string, error?: string}
     */
    validateBio(bio) {
        if (!bio) return { valid: true, bio: '' }; // Bio is optional
        
        const sanitized = this.sanitizeText(bio.trim());
        
        if (sanitized.length > MAX_BIO_LENGTH) {
            return { valid: false, error: `Bio must be less than ${MAX_BIO_LENGTH} characters` };
        }
        
        return { valid: true, bio: sanitized };
    },
    
    /**
     * Escape HTML characters for safe rendering
     * Prevents XSS attacks by escaping special characters
     * 
     * @param {string} str - String to escape
     * @returns {string} Escaped string safe for HTML rendering
     */
    escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, m => HTML_ESCAPE_MAP[m]);
    },
    
    /**
     * Safe render function for user-generated content
     * Alias for escapeHTML for semantic clarity
     * 
     * @param {string} str - String to safely render
     * @returns {string} Escaped string safe for HTML rendering
     */
    safeRender(str) {
        return this.escapeHTML(str);
    },
    
    /**
     * Validate profile picture URL
     * Checks URL format and optionally validates image extension
     * 
     * @param {string} url - Profile picture URL to validate
     * @returns {Object} Validation result with {valid: boolean, url?: string, error?: string}
     */
    validateProfilePicture(url) {
        if (!url) return { valid: true, url: null };
        
        const urlValidation = this.validateURL(url);
        if (!urlValidation.valid) {
            return urlValidation;
        }
        
        // Check if it's an image URL (basic check)
        const lowerUrl = url.toLowerCase();
        const hasImageExtension = IMAGE_EXTENSIONS.some(ext => lowerUrl.includes(ext));
        const isTrustedDomain = TRUSTED_DOMAINS.some(domain => lowerUrl.includes(domain));
        
        if (!hasImageExtension && !isTrustedDomain) {
            // Warning but allow it (only in debug mode)
            if (typeof window !== 'undefined' && window.DEBUG_MODE) {
                console.warn('Profile picture URL may not be an image');
            }
        }
        
        return { valid: true, url: urlValidation.url };
    },
    
    /**
     * Sanitize all profile data fields
     * Validates and sanitizes name, email, bio, and all URL fields
     * 
     * @param {Object} profileData - Profile data object to sanitize
     * @returns {Object} Sanitized profile data
     * @throws {Error} If validation fails for any field
     */
    sanitizeProfileData(profileData) {
        const sanitized = {};
        
        // Validate and sanitize name
        if (profileData.name) {
            const nameValidation = this.validateName(profileData.name);
            if (!nameValidation.valid) {
                throw new Error(nameValidation.error);
            }
            sanitized.name = nameValidation.name;
        }
        
        // Validate and sanitize email
        if (profileData.email) {
            const emailValidation = this.validateEmail(profileData.email);
            if (!emailValidation.valid) {
                throw new Error(emailValidation.error);
            }
            sanitized.email = emailValidation.email;
        }
        
        // Validate and sanitize bio
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
    
    /**
     * Show error message to user
     * TODO: Replace with proper toast notification system
     * 
     * @param {string} message - Error message to display
     */
    showError(message) {
        alert(`Error: ${message}`);
    },
    
    /**
     * Show success message
     * TODO: Replace with proper toast notification system
     * In production, use proper logging service
     * 
     * @param {string} message - Success message to display
     */
    showSuccess(message) {
        if (typeof window !== 'undefined' && window.DEBUG_MODE) {
            console.log(`Success: ${message}`);
        }
    }
};

// Export for use in other files
window.SecurityUtils = SecurityUtils;

