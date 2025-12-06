# Module 4: Code Generation & Structure

## Title: Prompt Engineering for Code Generation

### Lecture Content

Now that you have CURSOR_RULES.md and INSTRUCTIONS.md, it's time to generate code. This module teaches you how to write effective prompts that produce high-quality, production-ready code.

#### 1. Understanding Prompt Engineering

**What is Prompt Engineering?**
The art and science of crafting instructions that guide AI to produce desired outputs. In coding, this means writing prompts that generate:
- Correct, working code
- Well-structured, maintainable code
- Code that follows your conventions
- Code that solves the right problem

**Key Principle:** Better prompts = Better code. Invest time in crafting good prompts.

#### 2. Types of Prompts in Cursor

**Chat Prompts:**
- Conversational, iterative
- Good for exploration and refinement
- Use for: "How do I...?", "Can you explain...?", "What if...?"

**Composer Prompts:**
- Multi-file generation
- Good for creating complete features
- Use for: "Create a login system", "Add user authentication"

**Inline Prompts:**
- Context-specific suggestions
- Good for small improvements
- Use for: Refactoring, adding features to existing code

#### 3. Prompt Structure Best Practices

**The IDEAL Prompt Structure:**

**I - Intent:** What do you want to achieve?
```
Create a user authentication system
```

**D - Details:** What are the specific requirements?
```
with email/password login, JWT tokens, password hashing
```

**E - Examples:** What should it look like?
```
similar to how Auth0 handles authentication
```

**A - Architecture:** How should it be structured?
```
using Next.js API routes and Prisma for database
```

**L - Limitations:** What should be avoided?
```
don't store passwords in plain text, use bcrypt
```

**Complete Example:**
```
Create a user authentication system with email/password login.
Use JWT tokens for session management, bcrypt for password 
hashing, and Prisma for database operations. Structure it 
using Next.js API routes. Include error handling and 
validation. Don't store passwords in plain text.
```

#### 4. Context is King

**Providing Context:**

**Reference Existing Code:**
```
Add a delete button to the TodoList component, similar to 
how the edit button works in TodoItem.jsx
```

**Reference CURSOR_RULES:**
```
Following our CURSOR_RULES, create a React component using 
TypeScript and Tailwind CSS
```

**Reference INSTRUCTIONS:**
```
Based on our INSTRUCTIONS.md, implement the user 
authentication feature for the TodoMaster app
```

**Include File Structure:**
```
Create a new component in src/components/auth/LoginForm.tsx
that follows the same pattern as RegisterForm.tsx
```

#### 5. Generating Different Types of Code

**Components:**
```
Create a React component called ProductCard that:
- Displays product image, name, price
- Shows "Add to Cart" button
- Handles click events
- Uses Tailwind CSS for styling
- Follows our component structure in src/components/
```

**API Routes:**
```
Create a Next.js API route at /api/products/[id] that:
- Handles GET requests to fetch a product
- Handles PUT requests to update a product
- Returns JSON responses
- Includes error handling
- Uses Prisma to query the database
```

**Database Models:**
```
Create a Prisma model for User with:
- id (auto-increment)
- email (unique, required)
- password (hashed, required)
- createdAt, updatedAt timestamps
- Relation to Todo model (one-to-many)
```

**Tests:**
```
Write Jest tests for the TodoList component that:
- Test rendering with empty list
- Test adding a new todo
- Test marking todo as complete
- Test deleting a todo
- Use React Testing Library
```

#### 6. Iterative Prompt Refinement

**The Refinement Cycle:**

**Step 1: Initial Prompt**
```
Create a todo list component
```

**Step 2: Add Details**
```
Create a todo list component with add, complete, and delete 
functionality
```

**Step 3: Add Style Requirements**
```
Create a todo list component with add, complete, and delete 
functionality. Use Tailwind CSS, make it responsive, and 
add smooth animations
```

**Step 4: Add Technical Details**
```
Create a todo list component with add, complete, and delete 
functionality. Use Tailwind CSS, make it responsive, add 
smooth animations. Use React hooks for state, TypeScript 
for types, and persist to localStorage
```

**Step 5: Refine Based on Output**
```
The component works but needs better error handling. Add 
validation for empty todos and error messages for failed 
operations.
```

#### 7. Common Prompt Patterns

**Pattern 1: Feature Addition**
```
Add [feature] to [component/file] that [does what]. 
Use [technology] and follow [pattern from existing code].
```

**Pattern 2: Bug Fix**
```
Fix [issue] in [file]. The problem is [description]. 
The expected behavior is [what should happen].
```

**Pattern 3: Refactoring**
```
Refactor [component] to [improvement]. Keep the same 
functionality but [make it better in this way].
```

**Pattern 4: Code Review**
```
Review this code and suggest improvements for [aspect]:
[code snippet]
```

#### 8. Handling Complex Prompts

**Breaking Down Complex Features:**

**Instead of:**
```
Create a complete e-commerce checkout system
```

**Break it down:**
```
Step 1: Create a Cart component that displays items
Step 2: Add a CheckoutForm component for user details
Step 3: Create an API route to process payments
Step 4: Add order confirmation page
```

**Why This Works:**
- AI handles smaller tasks better
- You can review and refine each step
- Easier to debug issues
- More control over the process

#### 9. Reviewing Generated Code

**What to Check:**

**Functionality:**
- Does it work as expected?
- Are edge cases handled?
- Is error handling present?

**Code Quality:**
- Follows CURSOR_RULES conventions?
- Properly structured?
- Well-commented?
- Type-safe (if using TypeScript)?

**Integration:**
- Works with existing code?
- Uses correct imports?
- Follows project patterns?

**Security:**
- No sensitive data exposed?
- Proper validation?
- Secure by default?

### Exercises (Complete all 5)

1. **Simple Prompt:** Write a prompt to generate a "Contact Form" component.

2. **Detailed Prompt:** Refine your prompt to include validation, styling, and error handling.

3. **Context-Rich Prompt:** Write a prompt that references existing code patterns in your project.

4. **Multi-Step Prompt:** Break down "User Dashboard" into 3 smaller prompts.

5. **Code Review Prompt:** Write a prompt asking Cursor to review and improve a code snippet.

### Assignment (500–700 words)

**Generate a Complete Feature**

Using CURSOR_RULES.md and INSTRUCTIONS.md from previous modules, generate a complete feature (e.g., "User Profile Page", "Product Search", "Notification System").

**Deliverables:**
1. Initial prompt used
2. Generated code (with comments on what worked)
3. Refinement prompts (if needed)
4. Final code
5. Reflection on:
   - What worked well in your prompts
   - What needed refinement
   - How you iterated
   - Code quality assessment

**Submission Format:** GitHub repository with code + written reflection

### Quiz Questions

**Multiple Choice:**

1. Prompt engineering is:
   a) Writing code
   b) Crafting instructions for AI ✓
   c) Testing code
   d) Deploying code

2. The IDEAL prompt structure includes:
   a) Intent, Details, Examples, Architecture, Limitations ✓
   b) Only intent
   c) Only code
   d) Only examples

3. Context in prompts helps AI:
   a) Generate faster code
   b) Generate more accurate code ✓
   c) Skip validation
   d) Ignore conventions

4. Complex features should be:
   a) Generated in one prompt
   b) Broken into smaller steps ✓
   c) Skipped entirely
   d) Copied from examples

5. After generating code, you should:
   a) Use it immediately
   b) Review and test it ✓
   c) Deploy it
   d) Delete it

6. Iterative refinement means:
   a) Using first output
   b) Improving prompts based on results ✓
   c) Giving up
   d) Copying code

**Short Answer:**

7. Why is context important in prompts?

8. What are the benefits of breaking down complex features?

9. What should you check when reviewing generated code?

10. Explain the iterative refinement cycle.

### Reading Materials
- "Prompt Engineering Guide" (PDF provided)
- Example prompts from real projects
- Code generation best practices

### Resources
- Prompt templates library
- Code review checklist
- Refinement strategies guide
- Example generated code samples

**Next Steps:** Complete exercises before proceeding to Module 5: Iterative Refinement.

