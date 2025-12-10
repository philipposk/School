# Module 3: INSTRUCTIONS - Requirements & Planning

## Title: Writing Comprehensive INSTRUCTIONS.md Files

### Lecture Content

INSTRUCTIONS.md is where you define WHAT you're building. While CURSOR_RULES defines HOW, INSTRUCTIONS defines the WHAT—the features, user experience, and requirements that make your application unique.

#### 1. What Are INSTRUCTIONS?

INSTRUCTIONS.md contains:
- **App purpose** and target audience
- **Core features** and functionality
- **User workflows** and experiences
- **Data models** and relationships
- **Integration requirements**
- **Design preferences**

**Location:** Place `INSTRUCTIONS.md` in your project root, alongside CURSOR_RULES.md.

**Purpose:** Provides complete context for AI to generate code that matches your vision.

#### 2. Core Sections of INSTRUCTIONS.md

**Essential Sections:**

**App Planning:**
- What is your app called?
- What core problem does it solve?
- Who is it for?
- What's the "magic moment" for users?

**Essential Features:**
- Must-have features for MVP
- Nice-to-have features for future versions

**User Experience:**
- User roles and permissions
- What each user can do
- Access restrictions

**Integrations:**
- External APIs and services
- Real vs. simulated integrations
- Notification requirements

**Data & Privacy:**
- What data is stored
- Privacy settings
- GDPR/compliance needs

**Design & Branding:**
- Design vision and style
- Color schemes
- Dark/light mode support

#### 3. Writing Effective App Descriptions

**Be Specific About Purpose:**

**Example - Good:**
```markdown
- **What core problem does it solve, and for whom?**
  Helps indie builders turn napkin ideas into scoped projects 
  ready for Cursor. Solves the "blank page problem" when 
  starting new projects.
```

**Example - Bad:**
```markdown
- **What core problem does it solve, and for whom?**
  It's an app for everyone.
```

**Key Elements:**
- Specific problem statement
- Clear target audience
- Unique value proposition
- One-sentence summary

#### 4. Defining Features

**MVP vs. Future Features:**

**MVP Features (Must-Have):**
- Core functionality that makes the app useful
- Usually 3-5 key features
- Focus on solving the main problem

**Future Features (Nice-to-Have):**
- Enhancements and additions
- Can be added incrementally
- Don't block MVP launch

**Example:**
```markdown
### Essential Features
- User authentication
- Create and manage todos
- Mark todos as complete
- Delete todos

### Future Features
- Todo categories and tags
- Due dates and reminders
- Collaboration features
- Mobile app version
```

#### 5. User Experience Design

**Defining User Roles:**

**Single User:**
```markdown
- **What are the main user roles?**
  Single user role—no authentication needed
```

**Multiple Roles:**
```markdown
- **What are the main user roles?**
  Viewer (default), Editor (can modify), Admin (can delete)
```

**User Capabilities:**
```markdown
- **What should each user be able to do?**
  Viewers can browse and favorite
  Editors can add content
  Admins can moderate and delete
```

#### 6. The "Magic Moment"

**Defining the Core Experience:**

The "magic moment" is when users first experience the core value of your app.

**Examples:**

**Todo App:**
```
The magic moment: User adds their first todo and immediately 
sees it organized and ready to track.
```

**Social App:**
```
The magic moment: User posts their first update and receives 
instant engagement from the community.
```

**Productivity App:**
```
The magic moment: User completes their first task and sees 
their progress visualized beautifully.
```

**Why It Matters:** Guides all design and development decisions.

#### 7. Data Modeling

**Defining Data Structures:**

**Example:**
```markdown
- **What core data or objects are stored?**
  - Users: id, email, username, preferences
  - Todos: id, title, completed, userId, createdAt
  - Categories: id, name, color, userId
```

**Relationships:**
- One-to-many (User → Todos)
- Many-to-many (Todos ↔ Categories)
- Hierarchical (Parent → Child todos)

**Privacy Considerations:**
```markdown
- **Should users have privacy settings?**
  Users control visibility of their todos:
  - Private (default)
  - Shared with specific users
  - Public
```

#### 8. Integration Planning

**External APIs:**

**Real Integrations:**
```markdown
- **Should the app integrate with external APIs?**
  Yes: Stripe for payments (real), SendGrid for emails (real)
```

**Mocked Integrations:**
```markdown
- **For the MVP, do you want real integrations or simulated flows?**
  Mock all integrations for MVP to test UX; add real APIs in v2
```

**Why Mock First:**
- Test UX without API costs
- Develop faster
- Validate concept before committing

#### 9. Complete INSTRUCTIONS Template

**Full Template:**

```markdown
## Instructions

### App Planning & Requirements Gathering

- **What is your app called?**
  TodoMaster

- **What core problem does it solve, and for whom?**
  Helps busy professionals organize tasks and stay productive.
  Solves the problem of task management across multiple projects.

- **Can you describe the key workflow or the "main magic" moment?**
  User adds their first task, sees it beautifully organized,
  and immediately feels more in control of their workload.

### Essential Features
- User authentication
- Create, edit, delete todos
- Mark todos as complete
- Organize by projects/categories
- Search and filter todos

### Future Features
- Due dates and reminders
- Collaboration and sharing
- Mobile app
- Calendar integration

### User Experience
- **What are the main user roles?**
  Single user (with optional sharing later)

- **What should each user be able to do?**
  Create, edit, organize, and complete todos

- **Are there any access restrictions?**
  Users can only see and edit their own todos

### Integrations & Notifications
- **Should the app integrate with external APIs?**
  Google Calendar (future), Email reminders (future)

- **For the MVP, do you want real integrations or simulated flows?**
  Simulated flows for MVP

- **Should users receive notifications?**
  Email reminders for due todos (future feature)

### Data, Security & Privacy
- **What core data or objects are stored?**
  Users, Todos, Categories, Projects

- **Should users have privacy settings?**
  Todos are private by default

- **Any GDPR or compliance needs?**
  GDPR compliance for EU users

### Design & Branding
- **Any specific design vision?**
  Clean, minimalist, productivity-focused
  Colors: Blue (#3B82F6) and Gray (#6B7280)

- **Should the app support dark/light mode?**
  Both modes with system preference detection
```

### Exercises (Complete all 5)

1. **App Description:** Write a clear app description for a "Recipe Sharing" app, including problem, audience, and magic moment.

2. **Feature Prioritization:** List MVP vs. future features for a "Budget Tracker" app.

3. **User Roles:** Define user roles and capabilities for a "Team Collaboration" app.

4. **Data Modeling:** Create a data model for a "Book Reading Tracker" app with relationships.

5. **Magic Moment:** Describe the magic moment for three different app ideas.

### Assignment (500–700 words)

**Create Complete INSTRUCTIONS.md**

Choose a project idea and create a comprehensive INSTRUCTIONS.md file that includes:

1. Clear app description and purpose
2. Target audience definition
3. Magic moment description
4. MVP features list
5. Future features roadmap
6. User roles and capabilities
7. Data model structure
8. Integration requirements
9. Design vision
10. Privacy considerations

**Deliverables:**
1. Complete INSTRUCTIONS.md file
2. Written explanation of decisions
3. User journey map (simple diagram or description)
4. Reflection on how this guides development

**Submission Format:** GitHub repository with INSTRUCTIONS.md + written document

### Quiz Questions

**Multiple Choice:**

1. INSTRUCTIONS.md defines:
   a) How to code
   b) What to build ✓
   c) When to deploy
   d) Where to host

2. The "magic moment" refers to:
   a) When code compiles
   b) When users experience core value ✓
   c) When app launches
   d) When tests pass

3. MVP features should be:
   a) As many as possible
   b) 3-5 core features ✓
   c) All future features
   d) Only nice-to-haves

4. User roles should be defined:
   a) After building
   b) In INSTRUCTIONS.md ✓
   c) Only for complex apps
   d) By users themselves

5. Data modeling helps AI understand:
   a) Code structure
   b) Database relationships ✓
   c) API endpoints
   d) UI components

6. Mock integrations are useful for:
   a) Production apps
   b) Testing UX without costs ✓
   c) Final versions
   d) Complex features

**Short Answer:**

7. Why is it important to define the "magic moment"?

8. What's the difference between MVP and future features?

9. How does data modeling in INSTRUCTIONS help AI generation?

10. Explain why you might mock integrations in MVP but use real ones later.

### Reading Materials
- "Writing Effective Requirements" (PDF provided)
- Example INSTRUCTIONS.md files from real projects
- User experience design basics

### Resources
- INSTRUCTIONS.md template
- Feature prioritization framework
- User journey mapping guide
- Data modeling examples

**Next Steps:** Complete exercises before proceeding to Module 4: Code Generation.

