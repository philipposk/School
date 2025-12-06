# Module 2: Layout & Navigation

## Title: Building Multi-Screen Apps with Navigation and Layouts

### Lecture Content

Real iOS apps have multiple screens and need navigation between them. This module covers how to structure your app's layout and navigate between different views.

#### 1. Advanced Layout Techniques

**Spacer and Divider:**
```swift
VStack {
    Text("Top")
    Spacer()  // Pushes content apart
    Text("Bottom")
}

HStack {
    Text("Left")
    Spacer()
    Text("Right")
}

Divider()  // Horizontal line separator
```

**Frame Modifier:**
```swift
Text("Hello")
    .frame(width: 200, height: 100)
    .frame(maxWidth: .infinity, alignment: .leading)
    .frame(minHeight: 50)
```

**Alignment:**
```swift
VStack(alignment: .leading) { ... }
HStack(alignment: .top) { ... }
```

#### 2. NavigationView and NavigationLink

**Basic Navigation:**
```swift
NavigationView {
    VStack {
        NavigationLink("Go to Detail", destination: DetailView())
        Text("Main Screen")
    }
    .navigationTitle("Home")
    .navigationBarTitleDisplayMode(.large)
}
```

**NavigationLink with Data:**
```swift
NavigationLink(destination: DetailView(item: item)) {
    HStack {
        Text(item.name)
        Spacer()
        Image(systemName: "chevron.right")
    }
}
```

**Navigation Bar Customization:**
```swift
.navigationTitle("Title")
.navigationBarTitleDisplayMode(.inline)  // or .large, .automatic
.toolbar {
    ToolbarItem(placement: .navigationBarTrailing) {
        Button("Edit") { }
    }
}
```

#### 3. TabView for Tab Navigation

**Basic TabView:**
```swift
TabView {
    HomeView()
        .tabItem {
            Label("Home", systemImage: "house")
        }
    
    ProfileView()
        .tabItem {
            Label("Profile", systemImage: "person")
        }
    
    SettingsView()
        .tabItem {
            Label("Settings", systemImage: "gear")
        }
}
```

**TabView with Selection:**
```swift
@State private var selectedTab = 0

TabView(selection: $selectedTab) {
    // Views with tag values
}
```

#### 4. Grid Layouts

**LazyVGrid (Vertical Grid):**
```swift
let columns = [
    GridItem(.flexible()),
    GridItem(.flexible()),
    GridItem(.flexible())
]

LazyVGrid(columns: columns, spacing: 20) {
    ForEach(0..<9) { index in
        Color.blue
            .frame(height: 100)
    }
}
```

**LazyHGrid (Horizontal Grid):**
```swift
let rows = [GridItem(.flexible())]

ScrollView(.horizontal) {
    LazyHGrid(rows: rows, spacing: 20) {
        ForEach(items) { item in
            ItemView(item: item)
        }
    }
}
```

**GridItem Types:**
- `.flexible()` - Flexible width/height
- `.fixed(100)` - Fixed size
- `.adaptive(minimum: 50)` - Adaptive based on space

#### 5. ScrollView

**Vertical ScrollView:**
```swift
ScrollView {
    VStack(spacing: 20) {
        ForEach(items) { item in
            ItemRow(item: item)
        }
    }
    .padding()
}
```

**Horizontal ScrollView:**
```swift
ScrollView(.horizontal, showsIndicators: false) {
    HStack(spacing: 10) {
        ForEach(items) { item in
            ItemCard(item: item)
        }
    }
    .padding()
}
```

#### 6. Sheets and Full Screen Covers

**Presenting a Sheet:**
```swift
@State private var showSheet = false

Button("Show Sheet") {
    showSheet = true
}
.sheet(isPresented: $showSheet) {
    SheetView()
}
```

**Sheet with Data:**
```swift
.sheet(item: $selectedItem) { item in
    DetailView(item: item)
}
```

**Full Screen Cover:**
```swift
.fullScreenCover(isPresented: $isPresented) {
    FullScreenView()
}
```

#### 7. Alerts and Action Sheets

**Alert:**
```swift
@State private var showAlert = false

Button("Show Alert") {
    showAlert = true
}
.alert("Title", isPresented: $showAlert) {
    Button("OK") { }
    Button("Cancel", role: .cancel) { }
} message: {
    Text("Alert message here")
}
```

**Action Sheet:**
```swift
.confirmationDialog("Title", isPresented: $showActionSheet, titleVisibility: .visible) {
    Button("Option 1") { }
    Button("Option 2") { }
    Button("Cancel", role: .cancel) { }
}
```

### Exercises (Complete all 5)

1. Create a NavigationView with three NavigationLinks to different detail screens.
2. Build a TabView with 4 tabs, each showing different content.
3. Create a LazyVGrid with 6 items arranged in 2 columns.
4. Make a ScrollView containing 20 Text views with different colors.
5. Add a button that presents a sheet when tapped.

### Assignment (Multi-Screen App)

Create a multi-screen iOS app with navigation:

- **Requirements:**
  - Use NavigationView with at least 3 screens
  - Implement NavigationLink to navigate between screens
  - Add navigation titles to each screen
  - Include a TabView with at least 2 tabs
  - Use ScrollView in at least one screen
  - Add a button that presents a sheet
  - Use proper navigation bar styling

- **Deliverable:** Complete Xcode project with multiple view files
- **Bonus:** Add a LazyVGrid showing a collection of items

### Quiz Questions

**Multiple Choice:**

1. What is NavigationView used for?
   a) Creating tabs
   b) Navigating between screens ✓
   c) Laying out grids
   d) Showing alerts

2. How do you navigate to a new screen?
   a) NavigationLink ✓
   b) NavigationButton
   c) NavigateTo
   d) PushView

3. What does TabView create?
   a) Navigation stack
   b) Tab bar at bottom ✓
   c) Grid layout
   d) Scroll view

4. What is LazyVGrid used for?
   a) Horizontal scrolling
   b) Vertical grid layout ✓
   c) Navigation
   d) Alerts

5. How do you present a modal sheet?
   a) `.sheet()` modifier ✓
   b) `.modal()`
   c) `.present()`
   d) `.show()`

6. What does Spacer do?
   a) Adds padding
   b) Pushes views apart ✓
   c) Creates gaps
   d) Hides views

**Short Answer:**

7. What is the difference between NavigationView and TabView?
8. When would you use LazyVGrid instead of VStack?

### Reading Materials

- Apple's NavigationView documentation
- SwiftUI Layout Guide
- Human Interface Guidelines: Navigation

### Resources

- Navigation patterns cheat sheet
- Layout examples
- TabView template
- Starter multi-screen project

**Next Steps:** Complete exercises and assignment before proceeding to Module 3.

