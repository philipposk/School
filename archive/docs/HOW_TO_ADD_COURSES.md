# How to Add More Courses to Your Platform

## 🎓 Multi-Course Platform Guide

Your platform is now set up to support multiple courses! Here's how to add new courses.

## 📝 Adding a New Course

### Step 1: Add Course to JavaScript Array

Open `index.html` and find the `courses` array (around line 400). Add your new course:

```javascript
const courses = [
    {
        id: 'critical-thinking',
        title: 'Critical Thinking',
        description: 'Master clear reasoning and practical logic...',
        icon: '🧠',
        modules: 8,
        duration: '8 weeks',
        level: 'Intermediate',
        modules_data: [ /* module data */ ]
    },
    // ADD YOUR NEW COURSE HERE:
    {
        id: 'your-course-id',           // Unique identifier (no spaces, lowercase)
        title: 'Your Course Title',     // Display name
        description: 'Course description here...',
        icon: '📚',                     // Emoji icon
        modules: 10,                    // Number of modules
        duration: '10 weeks',           // Course duration
        level: 'Beginner',              // Beginner/Intermediate/Advanced
        modules_data: [
            { id: 1, title: 'Module 1 Title', subtitle: 'Module 1 subtitle' },
            { id: 2, title: 'Module 2 Title', subtitle: 'Module 2 subtitle' },
            // ... add all modules
        ]
    }
];
```

### Step 2: Create Course Content Files

Create your course content in the same structure:

```
course/
  modules/
    module01.md    (for course 1)
    module02.md
    ...
  quizzes/
    quiz1.json
    quiz2.json
    ...
```

**For a new course**, you can:
- Create a new folder: `course/course-name/modules/`
- Or use a naming convention: `course/modules/course-name-module01.md`

### Step 3: Update Module Loading (if needed)

If your course files are in a different location, update the `loadModule` function in `index.html`:

```javascript
// Current: fetches from course/modules/module01.md
// For new course, you might need:
const response = await fetch(`course/${courseId}/modules/module${moduleId}.md`);
```

## 🎨 Features Included

✅ **Course Listing Page** - Beautiful grid of all courses
✅ **Dark/Light Mode** - System preference detection + manual toggle
✅ **User Management** - Optional sign-in for progress tracking
✅ **Multi-Course Support** - Easy to add unlimited courses
✅ **Progress Tracking** - Per-course, per-user progress
✅ **Quiz System** - Interactive quizzes with hidden answers
✅ **Responsive Design** - Works on all devices

## 🌓 Dark Mode

- **Automatic**: Detects system preference on first visit
- **Manual Toggle**: Click 🌙/☀️ button in header
- **Persistent**: Saves user preference
- **System Sync**: Updates if system preference changes (when no manual preference set)

## 👤 User System

- **Optional Login**: Users can browse without signing in
- **Progress Tracking**: Sign in to save progress across sessions
- **Per-Course Progress**: Each course tracks independently
- **Profile Management**: Users can edit profile and view certificates

## 📊 Current Structure

```
School/
├── index.html              # Main platform (all courses)
├── course/
│   ├── modules/           # Critical Thinking modules
│   ├── quizzes/           # Critical Thinking quizzes
│   └── resources/         # Course resources
└── [Add more course folders here]
```

## 🚀 Quick Example: Adding a "Python Programming" Course

```javascript
{
    id: 'python-programming',
    title: 'Python Programming',
    description: 'Learn Python from scratch to advanced level.',
    icon: '🐍',
    modules: 12,
    duration: '12 weeks',
    level: 'Beginner',
    modules_data: [
        { id: 1, title: 'Introduction to Python', subtitle: 'Getting started' },
        { id: 2, title: 'Variables and Data Types', subtitle: 'Understanding data' },
        // ... 10 more modules
    ]
}
```

Then create:
- `course/python/modules/module01.md` through `module12.md`
- `course/python/quizzes/quiz1.json` through `quiz12.json`

## ✨ That's It!

Your platform is now a **complete multi-course learning management system** ready to scale!

