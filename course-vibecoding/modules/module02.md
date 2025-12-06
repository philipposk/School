# Module 2: CURSOR_RULES - Defining Your Tech Stack

## Title: Creating Effective CURSOR_RULES.md Files

### Lecture Content

CURSOR_RULES.md is your project's blueprint. It tells Cursor AI exactly how to structure code, which technologies to use, and what conventions to follow. A well-written CURSOR_RULES file dramatically improves the quality and consistency of AI-generated code.

#### 1. What Are CURSOR_RULES?

CURSOR_RULES.md is a markdown file that defines:
- **Technology choices** (languages, frameworks, libraries)
- **Code style** and conventions
- **Project structure** and organization
- **Development guardrails** and best practices

**Location:** Place `CURSOR_RULES.md` in your project root directory.

**Purpose:** Ensures AI generates code that matches your preferences and project requirements.

#### 2. Core Sections of CURSOR_RULES.md

**Essential Sections:**

**Languages to Use:**
```markdown
- **Languages to use?**
  JavaScript/TypeScript for frontend, Node.js for backend
```

**Frontend Framework:**
```markdown
- **Frontend framework preference?**
  React 18+ with TypeScript
```

**Styling Approach:**
```markdown
- **Styling approach?**
  Tailwind CSS 4 + custom theme tokens; utility-first
```

**State Management:**
```markdown
- **State management plan?**
  Zustand for session state, React hooks for local UI
```

**Backend Architecture:**
```markdown
- **Backend or data layer?**
  Next.js Route Handlers; optional Supabase for persistence
```

#### 3. Making Technology Decisions

**Considerations:**

**For Frontend:**
- **React** - Most popular, great AI support
- **Vue** - Simpler learning curve
- **Svelte** - Excellent performance
- **Vanilla JS** - No framework overhead

**For Styling:**
- **Tailwind CSS** - Utility-first, fast development
- **CSS Modules** - Component-scoped styles
- **Styled Components** - CSS-in-JS
- **Plain CSS** - Simple, no dependencies

**For State Management:**
- **useState/useContext** - Built-in, simple
- **Zustand** - Lightweight, easy to use
- **Redux** - Complex state needs
- **Jotai** - Atomic state management

**Recommendation:** Start simple, add complexity only when needed.

#### 4. Writing Effective CURSOR_RULES

**Best Practices:**

**Be Specific:**
```markdown
❌ Bad: "Use React"
✅ Good: "React 18+ with TypeScript, functional components only, hooks for state"
```

**Include Examples:**
```markdown
- **Styling approach?**
  Example: "Tailwind CSS 4 + custom theme tokens"
  Answer: Tailwind CSS with custom configuration
```

**Set Boundaries:**
```markdown
- **Testing expectations?**
  Jest for unit tests, React Testing Library for components
  Target: 80% coverage for critical paths
```

**Document Decisions:**
```markdown
- **Why this choice?**
  Tailwind chosen for rapid development and consistency
```

#### 5. Complete CURSOR_RULES Template

**Full Template Structure:**

```markdown
## Cursor Rules

### Development Rules
Define the delivery stack and guardrails for implementation.

- **Languages to use?**
  TypeScript everywhere (Next.js app + API)

- **Frontend framework preference?**
  Next.js App Router with React Server Components

- **Styling approach?**
  Tailwind CSS 4 + custom theme tokens; utility-first

- **State management plan?**
  Zustand for session state, React hooks for local UI

- **Backend or data layer?**
  Next.js Route Handlers; optional Supabase later

- **APIs to connect and which to mock?**
  Stripe for payments (real), SendGrid for emails (real)

- **Testing expectations?**
  Jest for unit tests, Playwright for E2E, 80% coverage

- **Security guidelines?**
  Never expose API keys client-side; rate-limit endpoints

- **Performance considerations?**
  Target <2s initial load, lazy-load images, code splitting

- **File organization conventions?**
  Feature-based: `features/auth/`, `features/dashboard/`

- **Commit conventions?**
  Conventional commits (feat/chore/fix/docs/test)
```

#### 6. Common Patterns and Examples

**Simple Static Site:**
```markdown
- Languages: HTML, CSS, JavaScript
- Framework: None (vanilla)
- Styling: Plain CSS with BEM naming
- Backend: None (static hosting)
```

**Full-Stack React App:**
```markdown
- Languages: TypeScript
- Framework: React 18 + Vite
- Styling: Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL with Prisma
```

**Next.js Application:**
```markdown
- Languages: TypeScript
- Framework: Next.js 14 App Router
- Styling: Tailwind CSS + shadcn/ui
- Backend: Next.js API routes
- Database: Supabase (PostgreSQL)
```

#### 7. Updating CURSOR_RULES Over Time

**When to Update:**
- Adding new technologies
- Changing project requirements
- Learning better patterns
- Team preferences change

**Version Control:**
- Commit CURSOR_RULES.md changes
- Document why changes were made
- Review impact on existing code

### Exercises (Complete all 5)

1. **Create CURSOR_RULES:** Write a CURSOR_RULES.md file for a simple todo app using React and Tailwind CSS.

2. **Compare Approaches:** Create two versions—one using React + Redux, another using React + Zustand. Compare the differences.

3. **Technology Research:** Research and document why you'd choose Tailwind CSS over CSS Modules for a specific project type.

4. **Template Adaptation:** Take the provided template and adapt it for a mobile app project (React Native).

5. **Review Existing:** Find an open-source project and analyze what their CURSOR_RULES.md might look like based on their codebase.

### Assignment (400–600 words)

**Create a Complete CURSOR_RULES.md**

Choose a project idea (e.g., "E-commerce product page", "Social media dashboard", "Weather app") and create a comprehensive CURSOR_RULES.md file that includes:

1. All technology decisions with justifications
2. Code style guidelines
3. File organization structure
4. Testing requirements
5. Security considerations
6. Performance targets

**Deliverables:**
1. Complete CURSOR_RULES.md file
2. Written explanation of each decision
3. Comparison with alternative choices
4. Reflection on how this guides AI generation

**Submission Format:** GitHub repository with CURSOR_RULES.md + written document

### Quiz Questions

**Multiple Choice:**

1. CURSOR_RULES.md should be placed:
   a) In any folder
   b) In project root directory ✓
   c) In node_modules
   d) In .git folder

2. The main purpose of CURSOR_RULES is to:
   a) Document code
   b) Guide AI code generation ✓
   c) Test code
   d) Deploy code

3. When choosing a frontend framework, you should:
   a) Always use React
   b) Choose based on project needs ✓
   c) Use the newest framework
   d) Avoid frameworks

4. For a simple static site, you should:
   a) Use React
   b) Use Next.js
   c) Consider vanilla JavaScript ✓
   d) Use Angular

5. CURSOR_RULES should be:
   a) Vague and flexible
   b) Specific and detailed ✓
   c) Short and simple
   d) Written in code

6. State management should be chosen based on:
   a) Popularity
   b) Project complexity needs ✓
   c) Latest trends
   d) Personal preference only

**Short Answer:**

7. List three sections that should be in every CURSOR_RULES.md file.

8. Why is it important to include examples in CURSOR_RULES?

9. When should you update your CURSOR_RULES.md file?

10. Explain the difference between choosing Tailwind CSS vs. CSS Modules for styling.

### Reading Materials
- "CURSOR_RULES Best Practices" (PDF provided)
- Example CURSOR_RULES.md files from real projects
- Technology decision-making guide

### Resources
- CURSOR_RULES.md template
- Technology comparison charts
- Code style guide examples
- Project structure templates

**Next Steps:** Complete exercises before proceeding to Module 3: INSTRUCTIONS.

