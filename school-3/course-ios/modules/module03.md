# Module 3: State Management

## Title: Managing App State with @State, @Binding, and @ObservableObject

### Lecture Content

State management is crucial in SwiftUI. Your app needs to track data that changes over time and update the UI accordingly. This module covers SwiftUI's state management tools.

#### 1. What is State?

State is data that can change over time. When state changes, SwiftUI automatically updates the UI.

**Key Concepts:**
- State is the source of truth for your UI
- Changes to state trigger UI updates
- State should be owned by the view that creates it

#### 2. @State Property Wrapper

`@State` is used for simple, local state owned by a view:

```swift
struct CounterView: View {
    @State private var count = 0
    
    var body: some View {
        VStack {
            Text("Count: \(count)")
            Button("Increment") {
                count += 1
            }
        }
    }
}
```

**When to use @State:**
- Simple values (Int, String, Bool)
- Local to a single view
- Not shared with other views

#### 3. @Binding for Two-Way Data Flow

`@Binding` creates a two-way connection between a parent and child view:

```swift
struct ParentView: View {
    @State private var text = ""
    
    var body: some View {
        ChildView(text: $text)  // $ creates binding
    }
}

struct ChildView: View {
    @Binding var text: String
    
    var body: some View {
        TextField("Enter text", text: $text)
    }
}
```

**Key Points:**
- Use `$` prefix to create binding
- Child view can read and modify parent's state
- No copy is made - it's a reference

#### 4. @ObservableObject and @Published

For complex state shared across views, use `ObservableObject`:

```swift
class UserData: ObservableObject {
    @Published var name = ""
    @Published var age = 0
}

struct ContentView: View {
    @StateObject private var userData = UserData()
    
    var body: some View {
        VStack {
            TextField("Name", text: $userData.name)
            Text("Age: \(userData.age)")
        }
    }
}
```

**@StateObject vs @ObservedObject:**
- `@StateObject` - Creates and owns the object
- `@ObservedObject` - Observes an object created elsewhere

#### 5. @EnvironmentObject

Share data across the entire view hierarchy:

```swift
class AppData: ObservableObject {
    @Published var theme = "light"
}

@main
struct MyApp: App {
    @StateObject private var appData = AppData()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appData)
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var appData: AppData
    
    var body: some View {
        Text("Theme: \(appData.theme)")
    }
}
```

#### 6. State Management Patterns

**Pattern 1: Simple State**
```swift
@State private var isOn = false
```

**Pattern 2: Shared State (Binding)**
```swift
@State private var text = ""
// Pass to child: ChildView(text: $text)
```

**Pattern 3: Complex State (ObservableObject)**
```swift
class DataModel: ObservableObject {
    @Published var items: [Item] = []
}
```

**Pattern 4: Global State (EnvironmentObject)**
```swift
.environmentObject(sharedData)
```

#### 7. Computed Properties

Derive UI from state:

```swift
@State private var firstName = ""
@State private var lastName = ""

var fullName: String {
    "\(firstName) \(lastName)"
}

var body: some View {
    Text(fullName)
}
```

#### 8. State Best Practices

**Do:**
- Use `@State` for simple, local state
- Use `@Binding` to share state with child views
- Use `@ObservableObject` for complex, shared state
- Keep state as close to where it's used as possible

**Don't:**
- Don't use `@State` for shared state
- Don't mutate state outside of the view's body
- Don't create unnecessary ObservableObjects

### Exercises (Complete all 5)

1. Create a counter with increment and decrement buttons using @State.
2. Build a parent view with a toggle, pass it to a child view using @Binding.
3. Create an ObservableObject class with @Published properties and use it in a view.
4. Make a form with multiple TextFields that update a single data model.
5. Implement a theme switcher using @EnvironmentObject.

### Assignment (Interactive Todo App)

Create a todo app with state management:

- **Requirements:**
  - Use @State for the list of todos
  - Create a form to add new todos
  - Each todo should have: title, completed status
  - Use @Binding for todo completion toggle
  - Add ability to delete todos
  - Show count of completed vs total todos
  - Use proper state management patterns

- **Deliverable:** Complete Xcode project with state management
- **Bonus:** Add filtering (all, active, completed) using state

### Quiz Questions

**Multiple Choice:**

1. What is @State used for?
   a) Shared state
   b) Local state owned by view ✓
   c) Global state
   d) Computed values

2. How do you create a binding?
   a) @Binding
   b) $ prefix ✓
   c) Binding()
   d) bind()

3. What does @Published do?
   a) Creates state
   b) Marks property as observable ✓
   c) Binds views
   d) Computes values

4. When should you use @ObservableObject?
   a) Simple local state
   b) Complex shared state ✓
   c) Constants
   d) Computed properties

5. What is @EnvironmentObject used for?
   a) Local state
   b) Shared across view hierarchy ✓
   c) Binding
   d) Published properties

6. What's the difference between @StateObject and @ObservedObject?
   a) Nothing
   b) @StateObject creates, @ObservedObject observes ✓
   c) They're the same
   d) @ObservedObject creates

**Short Answer:**

7. When would you use @Binding instead of @State?
8. Explain the difference between @State, @Binding, and @ObservableObject.

### Reading Materials

- Apple's State Management documentation
- "Data Flow Through SwiftUI" - WWDC session
- SwiftUI State Management best practices

### Resources

- State management cheat sheet
- ObservableObject template
- Binding examples
- Starter state management project

**Next Steps:** Complete exercises and assignment before proceeding to Module 4.

