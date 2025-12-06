// Internationalization (i18n) System
// Supports English and Greek

const i18n = {
    // Detect browser/system language, default to 'en' if not supported
    detectLanguage: function() {
        // Check localStorage first (user preference)
        const savedLang = localStorage.getItem('language');
        if (savedLang && (savedLang === 'en' || savedLang === 'el')) {
            return savedLang;
        }
        
        // Detect from browser/system settings
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        const langCode = browserLang.split('-')[0].toLowerCase(); // Get 'el' from 'el-GR'
        
        // Map browser language to supported languages
        if (langCode === 'el' || browserLang.toLowerCase().includes('greek')) {
            return 'el';
        }
        
        // Default to English
        return 'en';
    },
    
    currentLanguage: null, // Will be set in init()
    
    translations: {
        en: {
            // Header & Navigation
            logo: "🎓 Learning Platform",
            signIn: "Sign In",
            signOut: "Sign Out",
            myProfile: "My Profile",
            editProfile: "Edit Profile",
            myCertificates: "My Certificates",
            messages: "Messages",
            assignments: "Assignments",
            friends: "Friends",
            gdprData: "GDPR & Data",
            
            // Courses
            courses: "Courses",
            noCourses: "No courses available",
            startCourse: "Start Course",
            continueCourse: "Continue Course",
            viewCourse: "View Course",
            modules: "Modules",
            module: "Module",
            completed: "Completed",
            inProgress: "In Progress",
            notStarted: "Not Started",
            
            // Module Content
            takeQuiz: "Take Quiz",
            downloadPDF: "Download PDF",
            previousModule: "Previous Module",
            nextModule: "Next Module",
            completeCourse: "Complete Course ✓",
            loadingModule: "Loading module...",
            errorLoadingModule: "Error Loading Module",
            couldNotLoadModule: "Could not load module content. Please check that the file exists.",
            
            // Quiz
            quiz: "Quiz",
            question: "Question",
            submitQuiz: "Submit Quiz",
            yourScore: "Your Score",
            passed: "Passed",
            needToPass: "Need {score} to pass",
            youScored: "You scored {score}/{total}",
            
            // Assignments
            submitAssignment: "Submit Assignment",
            resubmitAssignment: "Resubmit Assignment",
            viewSubmission: "View Submission",
            assignment: "Assignment",
            assignments: "Assignments",
            noAssignments: "No Assignments",
            notSubmitted: "Not Submitted",
            submitted: "Submitted",
            grading: "Grading...",
            graded: "Graded",
            grade: "Grade",
            feedback: "Feedback",
            yourSubmission: "Your Submission",
            previousSubmission: "Previous Submission",
            previousGrade: "Previous Grade",
            dueDate: "Due",
            noDueDate: "No due date",
            submissionMethod: "Submission Method",
            writeText: "Write Text",
            uploadFile: "Upload File",
            chooseFile: "Choose File",
            yourAnswer: "Your Answer",
            minimumWords: "Minimum 200 words recommended",
            fileAccepted: "PDF, Word, or Text files accepted (Max 10MB)",
            cancel: "Cancel",
            remove: "Remove",
            submittedAt: "Submitted",
            
            // Easter Egg
            loadingSubmission: "Loading Submission...",
            oopsMyBad: "Oops my bad!",
            heresYourSubmission: "Here's your actual submission...",
            
            // Messages
            messaging: "Messaging",
            sendMessage: "Send Message",
            typeMessage: "Type a message...",
            noMessages: "No messages yet",
            startConversation: "Start a conversation by messaging a friend from your Friends list!",
            
            // Friends
            allFriends: "All Friends",
            discover: "Discover",
            following: "Following",
            follow: "Follow",
            unfollow: "Unfollow",
            message: "Message",
            viewProfile: "View Profile",
            
            // Certificates
            certificates: "Certificates",
            noCertificates: "No certificates yet",
            earnCertificates: "Complete courses to earn certificates!",
            certificate: "Certificate",
            issuedOn: "Issued on",
            
            // AI Chatbot
            aiChatbot: "AI Chatbot",
            askQuestion: "Ask a question...",
            send: "Send",
            
            // Common
            close: "Close",
            save: "Save",
            delete: "Delete",
            edit: "Edit",
            back: "Back",
            next: "Next",
            previous: "Previous",
            search: "Search",
            loading: "Loading...",
            error: "Error",
            success: "Success",
            
            // Hero section
            masterNewSkills: "Master New Skills",
            transformKnowledge: "Transform your knowledge with our comprehensive courses",
            exploreCourses: "Explore Courses",
            getStarted: "Get Started",
            continueLearning: "Continue Learning",
            
            // Settings
            settings: "Settings",
            theme: "Theme",
            layout: "Layout",
            language: "Language",
            english: "English",
            greek: "Greek",
            
            // Login/Signup
            login: "Login",
            signup: "Sign Up",
            email: "Email",
            password: "Password",
            name: "Name",
            confirmPassword: "Confirm Password",
            alreadyHaveAccount: "Already have an account?",
            dontHaveAccount: "Don't have an account?",
            
            // Errors
            pleaseSignIn: "Please sign in",
            pleaseSelectCourse: "Please select a course first",
            fileSizeExceeds: "File size exceeds 10MB limit",
            unsupportedFileType: "Unsupported file type. Please upload PDF, Word, Text, or RTF files.",
            pleaseWriteAssignment: "Please write your assignment before submitting.",
            pleaseSelectFile: "Please select a file to upload.",
            pleaseChooseFile: "Please choose a file to upload.",
        },
        
        el: {
            // Header & Navigation
            logo: "🎓 Πλατφόρμα Μάθησης",
            signIn: "Σύνδεση",
            signOut: "Αποσύνδεση",
            myProfile: "Το προφίλ μου",
            editProfile: "Επεξεργασία προφίλ",
            myCertificates: "Τα πιστοποιητικά μου",
            messages: "Μηνύματα",
            assignments: "Εργασίες",
            friends: "Φίλοι",
            gdprData: "GDPR & Δεδομένα",
            
            // Courses
            courses: "Μαθήματα",
            noCourses: "Δεν υπάρχουν διαθέσιμα μαθήματα",
            startCourse: "Έναρξη μαθήματος",
            continueCourse: "Συνέχεια μαθήματος",
            viewCourse: "Προβολή μαθήματος",
            modules: "Ενότητες",
            module: "Ενότητα",
            completed: "Ολοκληρωμένο",
            inProgress: "Σε εξέλιξη",
            notStarted: "Δεν ξεκίνησε",
            
            // Module Content
            takeQuiz: "Κάνε το κουίζ",
            downloadPDF: "Λήψη PDF",
            previousModule: "Προηγούμενη ενότητα",
            nextModule: "Επόμενη ενότητα",
            completeCourse: "Ολοκλήρωση μαθήματος ✓",
            loadingModule: "Φόρτωση ενότητας...",
            errorLoadingModule: "Σφάλμα φόρτωσης ενότητας",
            couldNotLoadModule: "Δεν ήταν δυνατή η φόρτωση του περιεχομένου της ενότητας. Παρακαλώ ελέγξτε ότι το αρχείο υπάρχει.",
            
            // Quiz
            quiz: "Κουίζ",
            question: "Ερώτηση",
            submitQuiz: "Υποβολή κουίζ",
            yourScore: "Η βαθμολογία σου",
            passed: "Πέρασες!",
            needToPass: "Χρειάζεσαι {score} για να περάσεις",
            youScored: "Πέτυχες {score}/{total}",
            
            // Assignments
            submitAssignment: "Υποβολή εργασίας",
            resubmitAssignment: "Επαναυποβολή εργασίας",
            viewSubmission: "Προβολή υποβολής",
            assignment: "Εργασία",
            assignments: "Εργασίες",
            noAssignments: "Δεν υπάρχουν εργασίες",
            notSubmitted: "Δεν υποβλήθηκε",
            submitted: "Υποβλήθηκε",
            grading: "Αξιολόγηση...",
            graded: "Αξιολογήθηκε",
            grade: "Βαθμός",
            feedback: "Σχόλια",
            yourSubmission: "Η υποβολή σου",
            previousSubmission: "Προηγούμενη υποβολή",
            previousGrade: "Προηγούμενος βαθμός",
            dueDate: "Προθεσμία",
            noDueDate: "Χωρίς προθεσμία",
            submissionMethod: "Μέθοδος υποβολής",
            writeText: "Γράψε κείμενο",
            uploadFile: "Ανέβασε αρχείο",
            chooseFile: "Επίλεξε αρχείο",
            yourAnswer: "Η απάντησή σου",
            minimumWords: "Συνιστάται τουλάχιστον 200 λέξεις",
            fileAccepted: "Αποδεκτά αρχεία PDF, Word ή Text (Μέγιστο 10MB)",
            cancel: "Ακύρωση",
            remove: "Αφαίρεση",
            submittedAt: "Υποβλήθηκε",
            
            // Easter Egg
            loadingSubmission: "Φόρτωση υποβολής...",
            oopsMyBad: "Ουπς, λάθος μου!",
            heresYourSubmission: "Να η πραγματική σου υποβολή...",
            
            // Messages
            messaging: "Μηνύματα",
            sendMessage: "Αποστολή μηνύματος",
            typeMessage: "Γράψε ένα μήνυμα...",
            noMessages: "Δεν υπάρχουν ακόμα μηνύματα",
            startConversation: "Ξεκίνησε μια συνομιλία στέλνοντας μήνυμα σε έναν φίλο από τη λίστα φίλων!",
            
            // Friends
            allFriends: "Όλοι οι φίλοι",
            discover: "Ανακάλυψη",
            following: "Ακολουθείς",
            follow: "Ακολούθησε",
            unfollow: "Κατάργηση ακολούθησης",
            message: "Μήνυμα",
            viewProfile: "Προβολή προφίλ",
            
            // Certificates
            certificates: "Πιστοποιητικά",
            noCertificates: "Δεν υπάρχουν ακόμα πιστοποιητικά",
            earnCertificates: "Ολοκλήρωσε μαθήματα για να κερδίσεις πιστοποιητικά!",
            certificate: "Πιστοποιητικό",
            issuedOn: "Εκδόθηκε στις",
            
            // AI Chatbot
            aiChatbot: "Chatbot AI",
            askQuestion: "Κάνε μια ερώτηση...",
            send: "Αποστολή",
            
            // Common
            close: "Κλείσιμο",
            save: "Αποθήκευση",
            delete: "Διαγραφή",
            edit: "Επεξεργασία",
            back: "Πίσω",
            next: "Επόμενο",
            previous: "Προηγούμενο",
            search: "Αναζήτηση",
            loading: "Φόρτωση...",
            error: "Σφάλμα",
            success: "Επιτυχία",
            
            // Hero section
            masterNewSkills: "Κατέκτησε νέες δεξιότητες",
            transformKnowledge: "Μεταμόρφωσε τη γνώση σου με τα ολοκληρωμένα μαθήματά μας",
            exploreCourses: "Εξερεύνησε μαθήματα",
            getStarted: "Ξεκίνα",
            continueLearning: "Συνέχισε τη μάθηση",
            startCourse: "Έναρξη μαθήματος",
            
            // Settings
            settings: "Ρυθμίσεις",
            theme: "Θέμα",
            layout: "Διάταξη",
            language: "Γλώσσα",
            english: "Αγγλικά",
            greek: "Ελληνικά",
            
            // Login/Signup
            login: "Σύνδεση",
            signup: "Εγγραφή",
            email: "Email",
            password: "Κωδικός",
            name: "Όνομα",
            confirmPassword: "Επιβεβαίωση κωδικού",
            alreadyHaveAccount: "Έχεις ήδη λογαριασμό;",
            dontHaveAccount: "Δεν έχεις λογαριασμό;",
            
            // Errors
            pleaseSignIn: "Παρακαλώ συνδέσου",
            pleaseSelectCourse: "Παρακαλώ επίλεξε πρώτα ένα μάθημα",
            fileSizeExceeds: "Το μέγεθος του αρχείου υπερβαίνει το όριο των 10MB",
            unsupportedFileType: "Μη υποστηριζόμενος τύπος αρχείου. Παρακαλώ ανέβασε αρχεία PDF, Word, Text ή RTF.",
            pleaseWriteAssignment: "Παρακαλώ γράψε την εργασία σου πριν την υποβάλεις.",
            pleaseSelectFile: "Παρακαλώ επίλεξε ένα αρχείο για ανέβασμα.",
            pleaseChooseFile: "Παρακαλώ επίλεξε ένα αρχείο για ανέβασμα.",
            
            // Additional UI elements
            viewModule: "Προβολή ενότητας",
        }
    },
    
    // Get translation for a key
    t(key, params = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] || this.translations.en[key] || key;
        
        // Replace parameters like {score} with actual values
        return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
            return params[paramKey] !== undefined ? params[paramKey] : match;
        });
    },
    
    // Set language
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            document.documentElement.lang = lang;
            this.updatePageLanguage();
        }
    },
    
    // Update page language attribute
    updatePageLanguage() {
        document.documentElement.lang = this.currentLanguage;
    },
    
    // Initialize
    init() {
        // Set current language (detect if not saved)
        if (!this.currentLanguage) {
            this.currentLanguage = this.detectLanguage();
        } else {
            // If language is saved, use it (but still detect on first visit)
            const savedLang = localStorage.getItem('language');
            if (savedLang && (savedLang === 'en' || savedLang === 'el')) {
                this.currentLanguage = savedLang;
            } else {
                this.currentLanguage = this.detectLanguage();
            }
        }
        localStorage.setItem('language', this.currentLanguage);
        this.updatePageLanguage();
    },
    
    // Get translated course data
    translateCourse(course) {
        const lang = this.currentLanguage;
        
        // If course has translations, use them
        if (course.translations && course.translations[lang]) {
            return {
                ...course,
                title: course.translations[lang].title || course.title,
                description: course.translations[lang].description || course.description,
                level: course.translations[lang].level || course.level,
                duration: course.translations[lang].duration || course.duration,
                modules_data: course.modules_data.map((module, index) => ({
                    ...module,
                    title: course.translations[lang].modules?.[index]?.title || module.title,
                    subtitle: course.translations[lang].modules?.[index]?.subtitle || module.subtitle
                }))
            };
        }
        
        // Fallback to original course data
        return course;
    },
    
    // Translate all courses
    translateCourses(courses) {
        return courses.map(course => this.translateCourse(course));
    }
};

// Make i18n globally available
window.i18n = i18n;

// Initialize on load
i18n.init();

