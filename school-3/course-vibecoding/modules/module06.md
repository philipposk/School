# Module 6: Testing & Quality Assurance

## Title: Ensuring AI-Generated Code Works Correctly

### Lecture Content

AI-generated code needs testing just like human-written code. This module teaches you how to generate tests with AI, run them effectively, and ensure your applications work correctly before deployment.

#### 1. Why Test AI-Generated Code?

**Reasons:**
- **AI can make mistakes** - Code might not work as expected
- **Edge cases** - AI might miss unusual scenarios
- **Integration issues** - Code might not work with existing systems
- **Confidence** - Tests prove your code works
- **Regression prevention** - Tests catch breaking changes

**Key Principle:** Trust, but verify. Always test AI-generated code.

#### 2. Types of Tests

**Unit Tests:**
- Test individual components/functions
- Fast, isolated
- Example: Testing a todo addition function

**Integration Tests:**
- Test how components work together
- Medium speed, multiple parts
- Example: Testing API endpoints with database

**End-to-End (E2E) Tests:**
- Test complete user workflows
- Slower, full system
- Example: Testing complete login flow

**Visual Regression Tests:**
- Test UI appearance
- Catch styling bugs
- Example: Ensuring components look correct

#### 3. Generating Tests with AI

**Prompt Structure for Test Generation:**

**Component Tests:**
```
Write Jest and React Testing Library tests for the TodoList 
component. Test:
- Rendering with empty list
- Adding a new todo
- Marking todo as complete
- Deleting a todo
- Error handling
```

**API Tests:**
```
Write Jest and Supertest tests for the /api/todos endpoint. 
Test:
- GET request returns todos
- POST request creates todo
- PUT request updates todo
- DELETE request removes todo
- Error cases (invalid data, missing auth)
```

**E2E Tests:**
```
Write Playwright tests for the todo app. Test:
- User can create account
- User can login
- User can add todos
- User can complete todos
- User can delete todos
```

#### 4. Test-Driven Development (TDD) with AI

**TDD Workflow:**

**Step 1: Write Tests First**
```
Ask AI: "Write tests for a TodoForm component that doesn't 
exist yet"
```

**Step 2: Generate Component**
```
Ask AI: "Create TodoForm component that passes these tests"
```

**Step 3: Refine**
```
Run tests, fix failures, iterate
```

**Benefits:**
- Clear requirements
- Better test coverage
- More focused code generation

#### 5. Running Tests

**Setting Up Test Environment:**

**Jest Configuration:**
```json
{
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/src/setupTests.ts"],
  "moduleNameMapper": {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  }
}
```

**Running Tests:**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test TodoList.test.tsx
```

#### 6. Interpreting Test Results

**Understanding Output:**

**Passing Tests:**
```
✓ TodoList renders correctly
✓ TodoList adds todos
✓ TodoList deletes todos

Tests: 3 passed, 3 total
```

**Failing Tests:**
```
✗ TodoList marks todos as complete
  Expected: true
  Received: false
  
  at TodoList.test.tsx:45
```

**What to Do:**
1. Read the error message
2. Understand what failed
3. Check the test expectations
4. Fix the code or test
5. Re-run tests

#### 7. Debugging Test Failures

**Common Issues:**

**Issue 1: Component Not Rendering**
```
Ask Cursor: "Why might this component not render in tests? 
Check imports and setup."
```

**Issue 2: Async Operations**
```
Ask Cursor: "Fix this test - it's failing because of async 
operations. Use proper async/await or waitFor."
```

**Issue 3: Mocking**
```
Ask Cursor: "Mock the API call in this test so it doesn't 
make real network requests."
```

**Issue 4: State Updates**
```
Ask Cursor: "This test fails because state doesn't update 
immediately. Fix the test to wait for state updates."
```

#### 8. Test Coverage

**Understanding Coverage:**

**Line Coverage:** Percentage of code lines executed
**Branch Coverage:** Percentage of code branches tested
**Function Coverage:** Percentage of functions called

**Target Coverage:**
- **Minimum:** 70% overall
- **Critical paths:** 90%+
- **New code:** 80%+

**Generating Coverage Reports:**
```bash
npm test -- --coverage
```

**Reviewing Coverage:**
- Identify untested code
- Focus on critical paths
- Don't obsess over 100% (not always practical)

#### 9. Testing Best Practices

**Do's:**
✅ Test user-facing behavior, not implementation
✅ Test edge cases and error scenarios
✅ Keep tests simple and readable
✅ Use descriptive test names
✅ Test one thing per test
✅ Mock external dependencies

**Don'ts:**
❌ Test implementation details
❌ Write tests that are too complex
❌ Skip error cases
❌ Test third-party libraries
❌ Write flaky tests
❌ Ignore failing tests

#### 10. Continuous Testing

**Automated Testing:**

**Pre-commit Hooks:**
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test"
    }
  }
}
```

**CI/CD Integration:**
```yaml
# GitHub Actions example
- name: Run tests
  run: npm test
  
- name: Check coverage
  run: npm test -- --coverage
```

**Benefits:**
- Catch issues early
- Prevent broken code from being merged
- Maintain code quality
- Build confidence

### Exercises (Complete all 5)

1. **Generate Tests:** Ask AI to generate tests for a component you created.

2. **Run Tests:** Set up Jest and run the generated tests.

3. **Fix Failures:** Debug and fix any test failures.

4. **Add Coverage:** Generate coverage report and identify gaps.

5. **Write E2E Test:** Create one end-to-end test using Playwright or Cypress.

### Assignment (500–700 words)

**Complete Test Suite**

Take code from previous modules and create a comprehensive test suite:

1. **Unit Tests:** Test all components individually
2. **Integration Tests:** Test API endpoints
3. **E2E Test:** Test one complete user flow
4. **Coverage Report:** Achieve 70%+ coverage

**Deliverables:**
1. Complete test suite
2. Test execution results
3. Coverage report
4. Reflection on:
   - Test quality and coverage
   - Challenges in testing AI-generated code
   - How tests helped find bugs
   - Improvements needed

**Submission Format:** GitHub repository with tests + coverage report + written reflection

### Quiz Questions

**Multiple Choice:**

1. Testing AI-generated code is:
   a) Unnecessary
   b) Essential ✓
   c) Optional
   d) Waste of time

2. Unit tests focus on:
   a) Complete workflows
   b) Individual components ✓
   c) UI appearance
   d) Performance

3. Test-driven development means:
   a) Write code first
   b) Write tests first ✓
   c) Skip tests
   d) Test manually

4. Good test coverage target is:
   a) 50%
   b) 70%+ ✓
   c) 30%
   d) 100% always

5. Tests should focus on:
   a) Implementation details
   b) User-facing behavior ✓
   c) Third-party code
   d) Internal variables

6. Continuous testing helps:
   a) Slow development
   b) Catch issues early ✓
   c) Skip manual testing
   d) Nothing

**Short Answer:**

7. Why is it important to test AI-generated code?

8. What's the difference between unit, integration, and E2E tests?

9. How do you debug a failing test?

10. Explain the benefits of test-driven development with AI.

### Reading Materials
- "Testing Strategies for AI-Generated Code" (PDF provided)
- Jest and React Testing Library documentation
- Test coverage best practices

### Resources
- Test generation prompt templates
- Testing setup guides
- Debugging test failures checklist
- Coverage analysis tools

**Next Steps:** Complete exercises before proceeding to Module 7: Integration & Deployment.

