# Module 7: Advanced UI

## Title: Animations, Gestures, and Custom Views

### Lecture Content

Great apps have smooth animations and intuitive gestures. This module covers how to add animations, handle gestures, and create custom reusable views in SwiftUI.

#### 1. Basic Animations

**Implicit Animation:**
```swift
@State private var scale: CGFloat = 1.0

Circle()
    .scaleEffect(scale)
    .onTapGesture {
        withAnimation {
            scale = scale == 1.0 ? 1.5 : 1.0
        }
    }
```

**Animation Modifiers:**
```swift
.animation(.default, value: scale)
.animation(.easeInOut, value: scale)
.animation(.spring(), value: scale)
```

**Animation Types:**
- `.default` - Default animation
- `.easeIn` - Slow start
- `.easeOut` - Slow end
- `.easeInOut` - Slow start and end
- `.spring()` - Spring animation
- `.linear` - Constant speed

#### 2. Spring Animations

**Custom Spring:**
```swift
.animation(.spring(response: 0.5, dampingFraction: 0.6), value: scale)
```

**Spring Parameters:**
- `response` - Duration of animation
- `dampingFraction` - How bouncy (0-1)
- Lower damping = more bounce

#### 3. Explicit Animations

**withAnimation:**
```swift
withAnimation(.spring()) {
    scale = 1.5
    opacity = 0.5
}
```

**Animation Block:**
```swift
withAnimation {
    // Multiple state changes
    scale = 1.5
    offset = CGSize(width: 100, height: 100)
}
```

#### 4. Transitions

**Basic Transition:**
```swift
@State private var show = false

if show {
    Text("Hello")
        .transition(.opacity)
}

Button("Toggle") {
    withAnimation {
        show.toggle()
    }
}
```

**Transition Types:**
- `.opacity` - Fade in/out
- `.scale` - Scale in/out
- `.slide` - Slide in/out
- `.move(edge: .leading)` - Move from edge
- `.asymmetric(insertion: .scale, removal: .opacity)` - Different in/out

**Combined Transitions:**
```swift
.transition(.scale.combined(with: .opacity))
```

#### 5. Gestures

**Tap Gesture:**
```swift
Text("Tap me")
    .onTapGesture {
        print("Tapped")
    }
```

**Long Press Gesture:**
```swift
Text("Long press")
    .onLongPressGesture {
        print("Long pressed")
    }
```

**Drag Gesture:**
```swift
@State private var offset = CGSize.zero

Circle()
    .offset(offset)
    .gesture(
        DragGesture()
            .onChanged { value in
                offset = value.translation
            }
            .onEnded { _ in
                withAnimation {
                    offset = .zero
                }
            }
    )
```

**Magnification Gesture:**
```swift
@State private var scale: CGFloat = 1.0

Image(systemName: "star")
    .scaleEffect(scale)
    .gesture(
        MagnificationGesture()
            .onChanged { value in
                scale = value
            }
    )
```

**Rotation Gesture:**
```swift
@State private var angle: Angle = .zero

Rectangle()
    .rotationEffect(angle)
    .gesture(
        RotationGesture()
            .onChanged { value in
                angle = value
            }
    )
```

#### 6. Simultaneous Gestures

**Combining Gestures:**
```swift
.gesture(
    DragGesture()
        .simultaneously(with: MagnificationGesture())
)
```

**Priority Gestures:**
```swift
.highPriorityGesture(TapGesture())
.simultaneousGesture(DragGesture())
```

#### 7. Custom Views

**Reusable Component:**
```swift
struct CustomButton: View {
    let title: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
        }
    }
}

// Usage
CustomButton(title: "Tap Me") {
    print("Tapped")
}
```

**Custom View with Parameters:**
```swift
struct CardView: View {
    let title: String
    let subtitle: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading) {
            Text(title)
                .font(.headline)
            Text(subtitle)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(color.opacity(0.1))
        .cornerRadius(10)
    }
}
```

#### 8. Custom Modifiers

**Creating Custom Modifier:**
```swift
struct CardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(10)
            .shadow(radius: 5)
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardStyle())
    }
}

// Usage
Text("Hello")
    .cardStyle()
```

#### 9. Drawing with SwiftUI

**Shapes:**
```swift
Circle()
    .fill(Color.blue)
    .frame(width: 100, height: 100)

Rectangle()
    .stroke(Color.red, lineWidth: 2)

RoundedRectangle(cornerRadius: 20)
    .fill(Color.green)
```

**Custom Path:**
```swift
struct CustomShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: 0, y: 0))
        path.addLine(to: CGPoint(x: rect.width, y: rect.height))
        return path
    }
}
```

#### 10. Animation Best Practices

**Do:**
- Use animations to provide feedback
- Keep animations subtle and purposeful
- Use spring animations for natural feel
- Animate state changes, not individual properties

**Don't:**
- Don't over-animate
- Don't use animations that distract
- Don't animate everything
- Don't use slow animations

### Exercises (Complete all 5)

1. Create a view that animates scale on tap using spring animation.
2. Build a draggable view that snaps back to center when released.
3. Create a custom card view component that can be reused.
4. Implement a custom modifier for a specific style.
5. Add a transition animation when showing/hiding a view.

### Assignment (Interactive Animated App)

Create an app with animations and gestures:

- **Requirements:**
  - Create at least 3 custom reusable views
  - Add tap, drag, and long press gestures
  - Implement spring animations
  - Use transitions for showing/hiding views
  - Create a custom modifier
  - Make interactions feel natural and responsive
  - Use proper animation timing

- **Deliverable:** Complete Xcode project with animations
- **Bonus:** Create a custom shape and animate it

### Quiz Questions

**Multiple Choice:**

1. What does withAnimation do?
   a) Creates animation
   b) Animates state changes ✓
   c) Draws shapes
   d) Handles gestures

2. What is a spring animation?
   a) Linear animation
   b) Bouncy animation ✓
   c) Fade animation
   d) Slide animation

3. What gesture detects dragging?
   a) TapGesture
   b) DragGesture ✓
   c) LongPressGesture
   d) PinchGesture

4. What is a transition?
   a) Animation type
   b) How views appear/disappear ✓
   c) Gesture type
   d) View modifier

5. How do you create a reusable view?
   a) Create a struct conforming to View ✓
   b) Use a function
   c) Use a class
   d) Use a protocol

6. What does ViewModifier do?
   a) Creates views
   b) Modifies view appearance ✓
   c) Handles gestures
   d) Animates views

**Short Answer:**

7. What's the difference between implicit and explicit animations?
8. When would you use a custom modifier vs a custom view?

### Reading Materials

- Apple's Animation documentation
- SwiftUI Gestures guide
- Human Interface Guidelines: Animation
- Custom views best practices

### Resources

- Animation cheat sheet
- Gesture examples
- Custom view templates
- Starter animation project

**Next Steps:** Complete exercises and assignment before proceeding to Module 8.

