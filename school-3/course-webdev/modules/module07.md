# Module 7: Version Control & Tools

## Title: Professional Development Workflow

### Lecture Content

Professional developers use version control to track changes, collaborate, and manage code. In this module, you'll learn Git basics, GitHub workflow, code organization, and essential development tools.

#### 1. What is Version Control?
Version control tracks changes to files over time:
- See history of changes
- Revert to previous versions
- Collaborate without conflicts
- Backup your code

**Git** is the most popular version control system.

#### 2. Git Basics
**Initial Setup:**
```bash
# Configure Git (one-time setup)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Check configuration
git config --list
```

**Basic Git Commands:**
```bash
# Initialize repository
git init

# Check status
git status

# Add files to staging
git add filename.html
git add .  # Add all files

# Commit changes
git commit -m "Initial commit: Add homepage"

# View commit history
git log

# View changes
git diff
```

#### 3. Git Workflow
**Three Areas:**
1. **Working Directory** - Your files
2. **Staging Area** - Files ready to commit
3. **Repository** - Committed changes

**Typical Workflow:**
```bash
# 1. Make changes to files
# 2. Stage changes
git add .

# 3. Commit changes
git commit -m "Descriptive message about changes"

# 4. Repeat
```

**Commit Messages:**
- Be descriptive
- Use present tense: "Add navigation menu" not "Added navigation menu"
- Keep it concise but clear

#### 4. GitHub
GitHub hosts Git repositories online:

**Creating a Repository:**
1. Go to github.com
2. Click "New repository"
3. Name it (e.g., "my-portfolio")
4. Choose public or private
5. Don't initialize with README (if you have code)
6. Click "Create repository"

**Connecting Local to GitHub:**
```bash
# Add remote repository
git remote add origin https://github.com/username/repo-name.git

# Push to GitHub
git push -u origin main

# Future pushes
git push
```

**Cloning a Repository:**
```bash
git clone https://github.com/username/repo-name.git
```

#### 5. Common Git Commands
**Branching:**
```bash
# Create branch
git branch feature-name

# Switch branch
git checkout feature-name
# or
git switch feature-name

# Create and switch
git checkout -b feature-name

# List branches
git branch

# Merge branch
git checkout main
git merge feature-name
```

**Undoing Changes:**
```bash
# Unstage file
git reset filename.html

# Discard changes in working directory
git checkout -- filename.html

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View previous versions
git log
git checkout commit-hash
```

#### 6. Code Organization
**File Structure:**
```
project/
├── index.html
├── css/
│   ├── styles.css
│   └── reset.css
├── js/
│   ├── main.js
│   └── utils.js
├── images/
│   └── logo.png
├── README.md
└── .gitignore
```

**README.md:**
```markdown
# Project Name

Description of your project.

## Features
- Feature 1
- Feature 2

## Setup
1. Clone repository
2. Open index.html in browser

## Technologies
- HTML
- CSS
- JavaScript
```

**.gitignore:**
```
# Ignore files
node_modules/
.DS_Store
*.log
.env
```

#### 7. Development Tools
**VS Code Extensions:**
- Live Server - Preview HTML files
- Prettier - Code formatting
- ESLint - JavaScript linting
- GitLens - Git integration
- Auto Rename Tag - HTML tag pairing

**Browser DevTools:**
- **Elements** - Inspect HTML/CSS
- **Console** - JavaScript debugging
- **Network** - Monitor API requests
- **Sources** - Debug JavaScript
- **Performance** - Analyze speed

**Using DevTools:**
```javascript
// Console logging
console.log("Debug message");
console.error("Error message");
console.table(data);

// Breakpoints
debugger; // Pauses execution
```

#### 8. Best Practices
**Code Organization:**
- Separate HTML, CSS, and JavaScript
- Use meaningful file names
- Comment complex code
- Keep functions small and focused
- Follow consistent naming conventions

**Git Best Practices:**
- Commit often with clear messages
- Don't commit sensitive data
- Use .gitignore
- Create branches for features
- Review changes before committing

**Project Management:**
- Plan before coding
- Break tasks into small steps
- Test frequently
- Document your code
- Keep learning

### Exercises (Complete all 5)
1. Initialize a Git repository and make your first commit.
2. Create a GitHub account and push your code.
3. Create a branch, make changes, and merge it.
4. Write a README.md for one of your projects.
5. Use browser DevTools to inspect and debug a webpage.

### Assignment (Multi-Page Website with Git)
Create a multi-page website and manage it with Git:
- **Requirements:**
  - At least 3 HTML pages (home, about, contact)
  - Shared CSS and JavaScript files
  - Organized file structure
  - Git repository initialized
  - Multiple commits with clear messages
  - Pushed to GitHub
  - README.md file
  - Professional organization

- **Deliverable:** Complete website + GitHub repository link
- **Word count:** N/A (focus on organization and Git workflow)

### Quiz Questions
**Multiple Choice:**
1. What is Git?
   a) A code editor
   b) Version control system ✓
   c) A programming language
   d) A website

2. What does `git add` do?
   a) Commits changes
   b) Stages files for commit ✓
   c) Creates repository
   d) Pushes to GitHub

3. What is GitHub?
   a) Version control system
   b) Hosting service for Git repositories ✓
   c) Code editor
   d) Programming language

4. What does `git commit` do?
   a) Saves changes to repository ✓
   b) Pushes to GitHub
   c) Creates branch
   d) Clones repository

5. What is a branch?
   a) A file
   b) Separate line of development ✓
   c) A commit
   d) A repository

6. What does `git push` do?
   a) Downloads code
   b) Uploads commits to remote repository ✓
   c) Creates branch
   d) Stages files

**Short Answer:**
7. What are the three areas in Git workflow?
8. Why is version control important for developers?

### Reading Materials
- "Git Basics Guide" (PDF provided)
- Git Documentation: git-scm.com/doc
- GitHub Guides: guides.github.com
- VS Code Documentation: code.visualstudio.com/docs

### Resources
- Git command cheat sheet
- GitHub workflow diagram
- VS Code shortcuts
- DevTools guide
- Code organization templates
- README template

**Next Steps:** Complete exercises and assignment before proceeding to Module 8.

