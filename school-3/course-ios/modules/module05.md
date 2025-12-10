# Module 5: User Input & Forms

## Title: Collecting User Input with TextFields, Pickers, and Form Validation

### Lecture Content

Apps need to collect user input. This module covers text fields, pickers, forms, and how to validate user input in SwiftUI.

#### 1. TextField

**Basic TextField:**
```swift
@State private var text = ""

TextField("Placeholder", text: $text)
```

**TextField Styles:**
```swift
TextField("Name", text: $text)
    .textFieldStyle(.roundedBorder)    // Bordered
    .textFieldStyle(.plain)            // Plain
    .textFieldStyle(.automatic)        // Automatic
```

**TextField Modifiers:**
```swift
TextField("Email", text: $email)
    .keyboardType(.emailAddress)
    .autocapitalization(.none)
    .disableAutocorrection(true)
    .submitLabel(.done)
```

**Keyboard Types:**
- `.default` - Standard keyboard
- `.emailAddress` - Email keyboard
- `.numberPad` - Numbers only
- `.decimalPad` - Decimal numbers
- `.phonePad` - Phone numbers
- `.URL` - URL keyboard

#### 2. SecureField

**Password Input:**
```swift
@State private var password = ""

SecureField("Password", text: $password)
```

#### 3. TextEditor

**Multi-line Text Input:**
```swift
@State private var text = ""

TextEditor(text: $text)
    .frame(height: 200)
```

#### 4. Pickers

**Picker with Selection:**
```swift
@State private var selectedColor = "Red"

Picker("Color", selection: $selectedColor) {
    Text("Red").tag("Red")
    Text("Blue").tag("Blue")
    Text("Green").tag("Green")
}
```

**Picker Styles:**
```swift
.pickerStyle(.menu)        // Dropdown menu
.pickerStyle(.segmented)   // Segmented control
.pickerStyle(.wheel)       // Wheel picker
```

**Picker with Array:**
```swift
let colors = ["Red", "Blue", "Green"]

Picker("Color", selection: $selectedColor) {
    ForEach(colors, id: \.self) { color in
        Text(color).tag(color)
    }
}
```

#### 5. DatePicker

**Basic DatePicker:**
```swift
@State private var date = Date()

DatePicker("Date", selection: $date)
```

**DatePicker Styles:**
```swift
DatePicker("Date", selection: $date)
    .datePickerStyle(.compact)      // Compact
    .datePickerStyle(.graphical)    // Calendar
    .datePickerStyle(.wheel)        // Wheel
```

**Date Range:**
```swift
DatePicker("Date", selection: $date, in: Date()..., displayedComponents: .date)
```

#### 6. Toggle

**Switch Toggle:**
```swift
@State private var isOn = false

Toggle("Enable notifications", isOn: $isOn)
```

**Toggle Styles:**
```swift
Toggle("Option", isOn: $isOn)
    .toggleStyle(.switch)      // Switch (default)
    .toggleStyle(.button)       // Button style
```

#### 7. Stepper

**Numeric Stepper:**
```swift
@State private var value = 0

Stepper("Value: \(value)", value: $value, in: 0...100)
```

**Stepper with Step:**
```swift
Stepper("Value: \(value)", value: $value, in: 0...100, step: 5)
```

#### 8. Slider

**Basic Slider:**
```swift
@State private var value: Double = 0.5

Slider(value: $value, in: 0...1)
```

**Slider with Steps:**
```swift
Slider(value: $value, in: 0...100, step: 5)
```

**Custom Slider:**
```swift
Slider(value: $value, in: 0...100) {
    Text("Volume")
} minimumValueLabel: {
    Text("0")
} maximumValueLabel: {
    Text("100")
}
```

#### 9. Form Validation

**Basic Validation:**
```swift
@State private var email = ""
@State private var showError = false

var isValidEmail: Bool {
    email.contains("@") && email.contains(".")
}

TextField("Email", text: $email)
    .onSubmit {
        if !isValidEmail {
            showError = true
        }
    }
    .alert("Invalid Email", isPresented: $showError) {
        Button("OK") { }
    }
```

**Real-time Validation:**
```swift
@State private var email = ""

var emailError: String? {
    if email.isEmpty {
        return nil
    }
    if !email.contains("@") {
        return "Email must contain @"
    }
    return nil
}

VStack(alignment: .leading) {
    TextField("Email", text: $email)
    if let error = emailError {
        Text(error)
            .foregroundColor(.red)
            .font(.caption)
    }
}
```

**Form Validation Pattern:**
```swift
struct FormData {
    var name: String = ""
    var email: String = ""
    var age: Int = 0
    
    var isValid: Bool {
        !name.isEmpty && 
        email.contains("@") && 
        age >= 18
    }
}
```

#### 10. Form Container

**Using Form:**
```swift
Form {
    Section("Personal Information") {
        TextField("Name", text: $name)
        TextField("Email", text: $email)
    }
    
    Section("Preferences") {
        Toggle("Notifications", isOn: $notifications)
        Picker("Theme", selection: $theme) {
            Text("Light").tag("light")
            Text("Dark").tag("dark")
        }
    }
    
    Section {
        Button("Submit") {
            submit()
        }
        .disabled(!isValid)
    }
}
```

### Exercises (Complete all 5)

1. Create a form with TextField for name and email with validation.
2. Build a picker that lets users select from 5 options.
3. Implement a DatePicker with a specific date range.
4. Create a form with Toggle, Stepper, and Slider controls.
5. Add real-time validation to a TextField showing error messages.

### Assignment (User Registration Form)

Create a complete user registration form:

- **Requirements:**
  - TextField for name (required, min 2 chars)
  - TextField for email (required, must contain @)
  - SecureField for password (required, min 8 chars)
  - DatePicker for birth date (must be 18+)
  - Picker for country selection
  - Toggle for terms acceptance (required)
  - Submit button (disabled until all valid)
  - Show validation errors in real-time
  - Use Form container with sections

- **Deliverable:** Complete Xcode project with form validation
- **Bonus:** Add password strength indicator

### Quiz Questions

**Multiple Choice:**

1. What is TextField used for?
   a) Displaying text
   b) Single-line text input ✓
   c) Multi-line text
   d) Password input

2. What keyboard type should you use for email?
   a) .default
   b) .emailAddress ✓
   c) .numberPad
   d) .URL

3. What is SecureField used for?
   a) Regular text
   b) Passwords ✓
   c) Multi-line text
   d) Numbers

4. How do you create a dropdown picker?
   a) .pickerStyle(.menu) ✓
   b) .pickerStyle(.wheel)
   c) .pickerStyle(.segmented)
   d) Picker()

5. What does DatePicker return?
   a) String
   b) Date ✓
   c) Int
   d) Bool

6. How do you validate form input?
   a) Computed properties ✓
   b) Functions
   c) Variables
   d) Constants

**Short Answer:**

7. What's the difference between TextField and TextEditor?
8. How do you disable a button until form is valid?

### Reading Materials

- Apple's TextField documentation
- Form input guide
- Human Interface Guidelines: Input
- Validation patterns

### Resources

- Form controls cheat sheet
- Validation examples
- Input templates
- Starter form project

**Next Steps:** Complete exercises and assignment before proceeding to Module 6.

