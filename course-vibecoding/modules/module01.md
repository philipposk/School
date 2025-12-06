# Module 1: Foundations of Vibecoding

## Title: Introduction to AI-Assisted Development with Cursor

### Lecture Content

Welcome to the world of vibecoding—a systematic approach to building applications with AI coding assistants. This module introduces you to Cursor AI and establishes the foundation for everything you'll learn in this course.

#### 1. What is Vibecoding?

Vibecoding is a methodology for building applications faster by leveraging AI coding assistants like Cursor. It combines:
- **Clear planning** through structured documentation
- **Iterative refinement** of AI-generated code
- **Best practices** for prompt engineering
- **Systematic workflows** that scale

**Key Principle:** AI doesn't replace thinking—it amplifies your ability to execute ideas quickly.

#### 2. Understanding Cursor AI

Cursor is an AI-powered code editor built on VS Code. It provides:
- **Composer:** Multi-file code generation
- **Chat:** Conversational code assistance
- **Autocomplete:** Context-aware suggestions
- **Codebase awareness:** Understands your entire project

**How it differs from ChatGPT:**
- Deep integration with your codebase
- Can read and modify multiple files simultaneously
- Understands project structure and dependencies
- Maintains context across conversations

#### 3. Setting Up Your Development Environment

**Required Tools:**
1. **Cursor Editor** - Download from cursor.sh
2. **Node.js** - Version 18+ recommended
3. **Git** - For version control
4. **GitHub Account** - For project hosting

**Initial Setup Steps:**
```bash
# Verify Node.js installation
node --version

# Verify Git installation
git --version

# Create your first project directory
mkdir my-first-vibecode-project
cd my-first-vibecode-project
```

**Cursor Configuration:**
- Sign up for Cursor account (free tier available)
- Configure API keys if using Pro features
- Set up your preferred theme and settings
- Install recommended extensions

#### 4. Your First AI-Generated Component

**Exercise: Generate a Simple React Component**

**Step 1:** Open Cursor in your project directory

**Step 2:** Create a new file `App.jsx`

**Step 3:** Use Cursor Chat and type:
```
Create a React component called Counter that:
- Displays a number starting at 0
- Has an "Increment" button that increases the number
- Has a "Decrement" button that decreases the number
- Has a "Reset" button that sets it back to 0
- Uses modern React hooks (useState)
- Has clean, simple styling
```

**Step 4:** Review the generated code

**Step 5:** Ask Cursor to add features:
```
Add a feature to save the counter value to localStorage
so it persists when the page refreshes
```

**What You'll Learn:**
- How Cursor understands context
- How to refine prompts for better results
- How to iterate on AI-generated code

#### 5. Understanding AI Limitations

**What AI Does Well:**
- Generating boilerplate code
- Creating common patterns
- Following established conventions
- Writing tests
- Refactoring code

**What AI Struggles With:**
- Understanding complex business logic without context
- Making architectural decisions without guidance
- Handling edge cases without explicit instructions
- Optimizing performance without requirements

**Key Insight:** AI is a powerful assistant, but you remain the architect.

#### 6. The Vibecoding Workflow

**The Complete Cycle:**
1. **Plan** - Define what you're building (INSTRUCTIONS.md)
2. **Configure** - Set up tech stack (CURSOR_RULES.md)
3. **Generate** - Use AI to create initial code
4. **Review** - Understand and validate generated code
5. **Refine** - Iterate and improve incrementally
6. **Test** - Ensure code works correctly
7. **Deploy** - Ship to production

**This course teaches you each step in detail.**

### Exercises (Complete all 5)

1. **Setup Check:** Install Cursor, Node.js, and Git. Verify all are working.

2. **First Component:** Generate a simple "Hello World" React component using Cursor Chat.

3. **Modify Component:** Ask Cursor to add props to your component and make it reusable.

4. **File Structure:** Use Cursor to create a basic React project structure with folders for components, pages, and styles.

5. **Documentation:** Write a brief README.md explaining what your component does and how to use it.

### Assignment (350–500 words)

**Build a Simple Todo Component**

Create a React component that:
- Displays a list of todos
- Allows adding new todos
- Allows marking todos as complete
- Allows deleting todos
- Persists data to localStorage

**Deliverables:**
1. Working component code
2. Brief explanation of how you used Cursor to generate it
3. List of any modifications you made after generation
4. Reflection on what worked well and what was challenging

**Submission Format:** GitHub repository link + written reflection

### Quiz Questions

**Multiple Choice:**

1. What is vibecoding?
   a) A programming language
   b) A methodology for AI-assisted development ✓
   c) A code editor
   d) A testing framework

2. Cursor AI's main advantage over ChatGPT is:
   a) It's free
   b) Deep integration with your codebase ✓
   c) It's faster
   d) It has better UI

3. The vibecoding workflow starts with:
   a) Generating code
   b) Planning ✓
   c) Testing
   d) Deploying

4. AI coding assistants excel at:
   a) Making architectural decisions
   b) Generating boilerplate code ✓
   c) Understanding complex business logic
   d) Optimizing performance

5. What should you always do after AI generates code?
   a) Use it immediately
   b) Review and understand it ✓
   c) Deploy it
   d) Delete it

6. The first step in setting up vibecoding is:
   a) Writing code
   b) Installing Cursor ✓
   c) Deploying
   d) Testing

**Short Answer:**

7. List three things AI coding assistants do well.

8. Why is it important to review AI-generated code before using it?

9. What is the difference between Cursor Chat and Cursor Composer?

10. Explain one limitation of AI coding assistants.

### Reading Materials
- Cursor AI Documentation: Getting Started
- "Introduction to AI-Assisted Development" (PDF provided)
- Example: Simple React Component Generation

### Resources
- Cursor AI setup checklist
- Node.js installation guide
- Git basics cheat sheet
- Example component templates

**Next Steps:** Complete exercises before proceeding to Module 2: CURSOR_RULES.

