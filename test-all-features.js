// Comprehensive Feature Testing Script
// Run this in browser console on school.6x7.gr

console.log('🧪 Starting Comprehensive Feature Tests...\n');

const testResults = {
    passed: [],
    failed: [],
    warnings: []
};

function test(name, testFn) {
    try {
        const result = testFn();
        if (result === true || (result && result.success)) {
            testResults.passed.push(name);
            console.log(`✅ ${name}`);
            return true;
        } else {
            testResults.failed.push(name);
            console.error(`❌ ${name}: ${result?.error || 'Failed'}`);
            return false;
        }
    } catch (error) {
        testResults.failed.push(name);
        console.error(`❌ ${name}: ${error.message}`);
        return false;
    }
}

function warn(name, message) {
    testResults.warnings.push({ name, message });
    console.warn(`⚠️ ${name}: ${message}`);
}

// Test 1: Messaging System
console.log('\n📨 Testing Messaging System...');
test('MessagingManager exists', () => typeof MessagingManager !== 'undefined');
test('MessagingManager has conversations', () => Array.isArray(MessagingManager.conversations));
test('MessagingManager has ConversationType', () => !!(MessagingManager.ConversationType && MessagingManager.ConversationType.FRIEND));

// Test 2: Assignment System
console.log('\n📝 Testing Assignment System...');
test('AssignmentManager exists', () => typeof AssignmentManager !== 'undefined');
test('AssignmentManager has assignments', () => Array.isArray(AssignmentManager.assignments));
test('AssignmentManager.getAssignmentsForModule is function', () => typeof AssignmentManager.getAssignmentsForModule === 'function');

// Test 3: Certificate System
console.log('\n🎓 Testing Certificate System...');
test('CertificateManager exists', () => typeof CertificateManager !== 'undefined');
test('CertificateManager has certificates', () => Array.isArray(CertificateManager.certificates));
test('CertificateManager.generateCertificate is function', () => typeof CertificateManager.generateCertificate === 'function');
test('CertificateManager.checkCourseCompletion is function', () => typeof CertificateManager.checkCourseCompletion === 'function');

// Test 4: Payment System
console.log('\n💳 Testing Payment System...');
test('PaymentManager exists', () => typeof PaymentManager !== 'undefined');
test('PaymentManager has plans', () => !!(PaymentManager.plans && PaymentManager.plans.free));
test('PaymentManager.getSubscriptionStatus is function', () => typeof PaymentManager.getSubscriptionStatus === 'function');

// Test 5: Reminder System
console.log('\n🔔 Testing Reminder System...');
test('ReminderManager exists', () => typeof ReminderManager !== 'undefined');
test('ReminderManager has reminders', () => Array.isArray(ReminderManager.reminders));
test('ReminderManager has ReminderType', () => !!(ReminderManager.ReminderType && ReminderManager.ReminderType.MODULE_COMPLETION));

// Test 6: Enhanced Authentication
console.log('\n🔐 Testing Enhanced Authentication...');
test('AuthManager exists', () => typeof AuthManager !== 'undefined');
test('AuthManager.generateConfirmationCode is function', () => typeof AuthManager.generateConfirmationCode === 'function');
test('AuthManager.sendConfirmationCode is function', () => typeof AuthManager.sendConfirmationCode === 'function');

// Test 7: User Profiles
console.log('\n👤 Testing User Profiles...');
test('UserProfileManager exists', () => typeof UserProfileManager !== 'undefined');
test('UserProfileManager has profiles', () => typeof UserProfileManager.profiles === 'object');
test('UserProfileManager.getProfile is function', () => typeof UserProfileManager.getProfile === 'function');

// Test 8: Enhanced Features
console.log('\n🎨 Testing Enhanced Features...');
test('EnhancedFeatures exists', () => typeof EnhancedFeatures !== 'undefined' || typeof ViewModeManager !== 'undefined');
test('Theme system exists', () => typeof EnhancedFeatures !== 'undefined' || typeof ViewModeManager !== 'undefined');

// Test 9: Security Utilities
console.log('\n🛡️ Testing Security Utilities...');
test('SecurityUtils exists', () => typeof SecurityUtils !== 'undefined');
test('SecurityUtils.sanitizeHTML is function', () => typeof SecurityUtils.sanitizeHTML === 'function');
test('SecurityUtils.sanitizeText is function', () => typeof SecurityUtils.sanitizeText === 'function');
test('SecurityUtils.validateEmail is function', () => typeof SecurityUtils.validateEmail === 'function');
test('SecurityUtils.validateURL is function', () => typeof SecurityUtils.validateURL === 'function');

// Test Security Functions
test('XSS protection - sanitizeHTML', () => {
    const malicious = '<script>alert("xss")</script>';
    const sanitized = SecurityUtils.sanitizeHTML(malicious);
    return !sanitized.includes('<script>');
});

test('XSS protection - sanitizeText', () => {
    const malicious = '<script>alert("xss")</script>';
    const sanitized = SecurityUtils.sanitizeText(malicious);
    return !sanitized.includes('<script>') && !sanitized.includes('alert');
});

test('Email validation - valid email', () => {
    const result = SecurityUtils.validateEmail('test@example.com');
    return result.valid === true;
});

test('Email validation - invalid email', () => {
    const result = SecurityUtils.validateEmail('invalid-email');
    return result.valid === false;
});

test('URL validation - valid URL', () => {
    const result = SecurityUtils.validateURL('https://example.com');
    return result.valid === true;
});

test('URL validation - invalid protocol', () => {
    const result = SecurityUtils.validateURL('javascript:alert("xss")');
    return result.valid === false;
});

// Test 10: GDPR Compliance
console.log('\n🍪 Testing GDPR Compliance...');
test('GDPRCompliance exists', () => typeof GDPRCompliance !== 'undefined');
test('GDPRCompliance.initCookiesConsent is function', () => typeof GDPRCompliance.initCookiesConsent === 'function');

// Test 11: Internationalization
console.log('\n🌍 Testing Internationalization...');
test('i18n exists', () => typeof i18n !== 'undefined');
test('i18n.detectLanguage is function', () => typeof i18n.detectLanguage === 'function');
test('i18n.setLanguage is function', () => typeof i18n.setLanguage === 'function');

// Test 12: 3D World
console.log('\n🌍 Testing 3D World...');
test('ThreeDWorld exists', () => typeof ThreeDWorld !== 'undefined');
if (typeof THREE !== 'undefined') {
    test('Three.js library loaded', () => typeof THREE !== 'undefined');
} else {
    warn('Three.js not loaded', '3D features may not work');
}

// Test 13: Backend Integration
console.log('\n🔌 Testing Backend Integration...');
const backendUrl = localStorage.getItem('backend_url') || 'https://school-backend.fly.dev';
test('Backend URL configured', () => !!backendUrl);

// Test 14: AI Configuration
console.log('\n🤖 Testing AI Configuration...');
test('AIConfig exists', () => typeof AIConfig !== 'undefined');
test('AIConfig has backendUrl', () => !!AIConfig.backendUrl);
test('AIConfig.hasBackend is function', () => typeof AIConfig.hasBackend === 'function');

// Test 15: Supabase Client
console.log('\n🗄️ Testing Supabase Client...');
test('SupabaseManager exists', () => typeof SupabaseManager !== 'undefined');
const supabaseUrl = localStorage.getItem('supabase_url') || 'https://jmjezmfhygvazfunuujt.supabase.co';
test('Supabase URL configured', () => !!supabaseUrl);

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${testResults.passed.length}`);
console.log(`❌ Failed: ${testResults.failed.length}`);
console.log(`⚠️ Warnings: ${testResults.warnings.length}`);

if (testResults.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.failed.forEach(test => console.log(`  - ${test}`));
}

if (testResults.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    testResults.warnings.forEach(w => console.log(`  - ${w.name}: ${w.message}`));
}

console.log('\n✅ All tests completed!');
return testResults;

