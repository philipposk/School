# Module 1: SwiftUI Foundations

## Title: Your First SwiftUI App - Views, Modifiers, and the Declarative Paradigm

### Lecture Content

Welcome to iOS development with SwiftUI! SwiftUI is Apple's modern, declarative framework for building user interfaces. Unlike traditional imperative programming, SwiftUI lets you describe what your UI should look like, and the framework handles how to make it happen.

#### 1. What is SwiftUI?

SwiftUI is a declarative UI framework introduced by Apple in 2019. It allows you to build user interfaces by describing what you want, not how to achieve it.

**Key Concepts:**
- **Declarative:** You describe the desired state, SwiftUI figures out how to render it
- **Composable:** Build complex UIs from simple, reusable components
- **Reactive:** UI automatically updates when data changes
- **Cross-platform:** Works on iOS, iPadOS, macOS, watchOS, and tvOS

#### 2. Setting Up Xcode

**First Steps:**
1. Download Xcode from the Mac App Store (free, ~12GB)
2. Open Xcode and create a new project
3. Choose "App" template
4. Select "SwiftUI" as the interface
5. Choose a name and organization identifier

**Xcode Interface Overview:**
- **Navigator:** File browser on the left
- **Editor:** Code editor in the center
- **Inspector:** Properties panel on the right
- **Canvas:** Live preview (Cmd+Option+Return)

#### 3. Your First SwiftUI View

Every SwiftUI view is a struct that conforms to the `View` protocol:

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Hello, SwiftUI!")
            .font(.largeTitle)
            .foregroundColor(.blue)
            .padding()
    }
}
```

**Breaking it down:**
- `struct ContentView: View` - Our view struct conforming to View protocol
- `var body: some View` - The content of our view
- `Text()` - A text view displaying a string
- `.font()`, `.foregroundColor()`, `.padding()` - Modifiers that style the view

#### 4. Understanding Modifiers

Modifiers are methods that return a new view with modified properties. They chain together:

```swift
Text("Hello")
    .font(.headline)           // Set font
    .foregroundColor(.blue)    // Set text color
    .padding()                 // Add padding
    .background(Color.gray)   // Add background
    .cornerRadius(10)          // Round corners
```

**Common Modifiers:**
- `.font()` - Text size and style
- `.foregroundColor()` - Text color
- `.background()` - Background color or view
- `.padding()` - Add spacing
- `.cornerRadius()` - Round corners
- `.shadow()` - Add shadow
- `.frame()` - Set size and alignment

#### 5. Basic Layout: Stacks

SwiftUI uses stacks to arrange views:

**VStack (Vertical Stack):**
```swift
VStack {
    Text("First")
    Text("Second")
    Text("Third")
}
```

**HStack (Horizontal Stack):**
```swift
HStack {
    Text("Left")
    Text("Right")
}
```

**ZStack (Overlay Stack):**
```swift
ZStack {
    Color.blue
    Text("On top")
}
```

**Stack Alignment and Spacing:**
```swift
VStack(alignment: .leading, spacing: 20) {
    Text("Aligned left")
    Text("With spacing")
}
```

#### 6. Colors and Images

**Colors:**
```swift
Color.blue           // System color
Color(red: 0.5, green: 0.3, blue: 0.8)  // Custom RGB
Color("MyColor")     // From asset catalog
```

**Images:**
```swift
Image(systemName: "star.fill")  // SF Symbol
Image("myImage")                // From asset catalog
    .resizable()
    .scaledToFit()
    .frame(width: 100, height: 100)
```

#### 7. SF Symbols

Apple provides thousands of icons through SF Symbols:

```swift
Image(systemName: "heart.fill")
    .font(.system(size: 50))
    .foregroundColor(.red)
```

Browse symbols at: developer.apple.com/sf-symbols

#### 8. Preview Canvas

Xcode's preview canvas lets you see your UI in real-time:

```swift
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .previewDevice("iPhone 14 Pro")
    }
}
```

**Preview Tips:**
- Press Cmd+Option+Return to toggle preview
- Right-click preview for options
- Test different devices and orientations
- Preview multiple views at once

### Exercises (Complete all 5)

1. Create a view with your name in large, bold text, centered on the screen.
2. Build a VStack with three Text views, each with different colors and font sizes.
3. Create an HStack with an SF Symbol icon and text next to it.
4. Make a ZStack with a colored background and centered text on top.
5. Combine VStack and HStack to create a simple card layout with padding and rounded corners.

### Assignment (Personal Profile Card)

Create a SwiftUI view that displays a personal profile card:

- **Requirements:**
  - Use VStack for vertical layout
  - Include your name (large title)
  - Add a profile image placeholder (use SF Symbol or Color)
  - List 3-5 skills or interests using HStack
  - Use different colors and fonts
  - Add padding and rounded corners
  - Use ZStack if you want a background

- **Deliverable:** Xcode project with ContentView.swift
- **Bonus:** Add an SF Symbol for each skill/interest

### Quiz Questions

**Multiple Choice:**

1. What is SwiftUI?
   a) A programming language
   b) A declarative UI framework ✓
   c) An IDE
   d) A database

2. What does a View protocol require?
   a) A body property ✓
   b) A render method
   c) A layout function
   d) An init method

3. What does VStack arrange views in?
   a) Horizontal line
   b) Vertical line ✓
   c) Overlapping
   d) Grid

4. What are modifiers?
   a) Functions that modify views ✓
   b) Variables
   c) Protocols
   d) Classes

5. How do you add padding in SwiftUI?
   a) `.padding()` modifier ✓
   b) `padding()` function
   c) `setPadding()` method
   d) Padding property

6. What is the preview canvas used for?
   a) Writing code
   b) Seeing UI in real-time ✓
   c) Debugging
   d) Testing

**Short Answer:**

7. What is the difference between declarative and imperative programming?
8. Name three common SwiftUI modifiers and what they do.

### Reading Materials

- Apple's SwiftUI Tutorials: developer.apple.com/tutorials/swiftui
- "SwiftUI by Example" - Hacking with Swift
- Xcode documentation (Help → Xcode Help)

### Resources

- SwiftUI modifier cheat sheet
- SF Symbols browser
- Xcode keyboard shortcuts
- Starter project template

**Next Steps:** Complete exercises and assignment before proceeding to Module 2.

