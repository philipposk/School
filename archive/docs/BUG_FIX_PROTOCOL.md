# 🐛 Bug Fix Protocol

## Mandatory Steps When Fixing Bugs

### 1. Fix the Bug ✅
- Resolve the issue in the code
- Test the fix manually
- Verify it works

### 2. Add Regression Test 📝
**MANDATORY:** Add a test case to `COMPREHENSIVE_TEST_SUITE.md` that would catch this bug.

**Location:** Add to the appropriate section (Quiz, Auth, UI, etc.)

**Format:**
```markdown
- [ ] **Test Name** - Description of what to test
  - Regression test: Fixed bug where [description]
  - Test: [Steps to verify]
```

### 3. Update Known Bugs List 📋
Add the bug to the "Known Fixed Bugs & Regression Tests" section at the end of `COMPREHENSIVE_TEST_SUITE.md`

**Format:**
```markdown
1. **Bug:** [Brief description]
   - **Fixed:** [What was changed]
   - **Regression Test:** "[Test name]" (Section X)
   - **Date Fixed:** [Date]
```

### 4. Update .cursorrules 🔧
If this is a common pattern or important lesson, add it to `.cursorrules` under "Known Issues & Test Coverage"

### 5. Document Pattern (if applicable) 📚
If this bug reveals a common pattern (e.g., "always check for null before DOM access"), add it to the Code Quality Standards in `.cursorrules`

---

## Example Workflow

### User Reports Bug:
"Quiz answers not showing after submission for questions 2-4"

### Step 1: Fix
```javascript
// Added null checks
const explanation = document.getElementById(`explanation_${idx}`);
if (explanation) {
    explanation.classList.add('show');
}
```

### Step 2: Add Test
Added to COMPREHENSIVE_TEST_SUITE.md Section 3:
```markdown
- [ ] **All explanations visible after submission** - Explanations show for ALL questions
  - Regression test: Fixed bug where only first question explanation displayed
  - Test: Submit quiz with 4+ questions, verify all explanations appear
```

### Step 3: Update Known Bugs
Added to "Known Fixed Bugs & Regression Tests":
```markdown
1. **Bug:** Quiz answers not displaying after submission (only first question showed explanation)
   - **Fixed:** Added null checks for explanation elements
   - **Regression Test:** "All explanations visible after submission" (Section 3)
   - **Date Fixed:** January 8, 2025
```

### Step 4: Update .cursorrules
Added to "Known Issues & Test Coverage":
```markdown
### Quiz System
- ✅ Fixed: Quiz answers not displaying after submission (all questions)
```

---

## Why This Matters

1. **Prevents Regression** - Tests catch if bug comes back
2. **Documents Patterns** - Future agents learn from past bugs
3. **Improves Coverage** - Test suite grows with each fix
4. **Knowledge Sharing** - Other chats/agents benefit from your fixes

---

## Quick Checklist

When fixing a bug, ensure you:
- [ ] Fixed the code
- [ ] Added regression test to COMPREHENSIVE_TEST_SUITE.md
- [ ] Added to "Known Fixed Bugs" section
- [ ] Updated .cursorrules if it's a common pattern
- [ ] Tested the fix works
- [ ] Verified test would catch the bug

---

**Remember:** Every bug fix is an opportunity to improve test coverage! 🎯

