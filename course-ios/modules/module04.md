# Module 4: Lists & Data

## Title: Displaying Dynamic Data with Lists, Models, and Persistence

### Lecture Content

Most apps need to display lists of data and persist that data between app launches. This module covers List views, data models, and simple persistence.

#### 1. List Views

**Basic List:**
```swift
List {
    Text("Item 1")
    Text("Item 2")
    Text("Item 3")
}
```

**List with ForEach:**
```swift
let items = ["Apple", "Banana", "Orange"]

List {
    ForEach(items, id: \.self) { item in
        Text(item)
    }
}
```

**Shorthand List:**
```swift
List(items, id: \.self) { item in
    Text(item)
}
```

#### 2. Data Models

**Simple Struct:**
```swift
struct Item: Identifiable {
    let id = UUID()
    var name: String
    var isCompleted: Bool
}
```

**Using Identifiable:**
```swift
struct Item: Identifiable {
    let id = UUID()
    var name: String
}

List(items) { item in
    Text(item.name)
}
```

**Complex Model:**
```swift
struct Person: Identifiable, Codable {
    let id = UUID()
    var name: String
    var age: Int
    var email: String
}
```

#### 3. List Styles

**Different List Styles:**
```swift
List(items) { item in
    Text(item.name)
}
.listStyle(.plain)        // No grouping
.listStyle(.grouped)      // Grouped style
.listStyle(.insetGrouped) // Inset grouped (iOS default)
```

**Custom Row Appearance:**
```swift
List {
    ForEach(items) { item in
        HStack {
            Image(systemName: "star")
            Text(item.name)
            Spacer()
            if item.isCompleted {
                Image(systemName: "checkmark")
            }
        }
    }
}
```

#### 4. List Modifiers

**Delete and Move:**
```swift
List {
    ForEach(items) { item in
        Text(item.name)
    }
    .onDelete(perform: deleteItems)
    .onMove(perform: moveItems)
}
.navigationBarItems(trailing: EditButton())
```

**Swipe Actions:**
```swift
List {
    ForEach(items) { item in
        Text(item.name)
            .swipeActions {
                Button("Delete", role: .destructive) {
                    delete(item)
                }
                Button("Edit") {
                    edit(item)
                }
            }
    }
}
```

#### 5. UserDefaults for Simple Persistence

**Saving Data:**
```swift
UserDefaults.standard.set("value", forKey: "key")
UserDefaults.standard.set(42, forKey: "number")
UserDefaults.standard.set(true, forKey: "bool")
```

**Reading Data:**
```swift
let value = UserDefaults.standard.string(forKey: "key")
let number = UserDefaults.standard.integer(forKey: "number")
let bool = UserDefaults.standard.bool(forKey: "bool")
```

**Saving Arrays:**
```swift
let items = ["a", "b", "c"]
UserDefaults.standard.set(items, forKey: "items")

let savedItems = UserDefaults.standard.stringArray(forKey: "items") ?? []
```

**Saving Custom Objects (Codable):**
```swift
struct Item: Codable {
    var name: String
    var value: Int
}

let item = Item(name: "Test", value: 42)
if let encoded = try? JSONEncoder().encode(item) {
    UserDefaults.standard.set(encoded, forKey: "item")
}

if let data = UserDefaults.standard.data(forKey: "item"),
   let decoded = try? JSONDecoder().decode(Item.self, from: data) {
    print(decoded.name)
}
```

#### 6. Core Data Basics (Introduction)

**Setting Up Core Data:**
1. Add Core Data model file (.xcdatamodeld)
2. Define entities and attributes
3. Create NSManagedObjectContext

**Basic Usage:**
```swift
import CoreData

@Environment(\.managedObjectContext) var moc

// Save
try? moc.save()

// Fetch
@FetchRequest(
    sortDescriptors: [NSSortDescriptor(keyPath: \Item.name, ascending: true)]
) var items: FetchedResults<Item>
```

#### 7. Sectioned Lists

**List with Sections:**
```swift
List {
    Section("Fruits") {
        ForEach(fruits) { fruit in
            Text(fruit.name)
        }
    }
    
    Section("Vegetables") {
        ForEach(vegetables) { vegetable in
            Text(vegetable.name)
        }
    }
}
```

**Dynamic Sections:**
```swift
ForEach(groupedItems.keys.sorted(), id: \.self) { category in
    Section(category) {
        ForEach(groupedItems[category]!) { item in
            Text(item.name)
        }
    }
}
```

#### 8. Search and Filtering

**Searchable List:**
```swift
@State private var searchText = ""

List(filteredItems) { item in
    Text(item.name)
}
.searchable(text: $searchText)

var filteredItems: [Item] {
    if searchText.isEmpty {
        return items
    } else {
        return items.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }
}
```

### Exercises (Complete all 5)

1. Create a List displaying an array of 10 items with custom row design.
2. Build a data model struct with 3 properties and display it in a List.
3. Implement saving and loading data using UserDefaults.
4. Create a sectioned List with at least 2 sections.
5. Add search functionality to a List view.

### Assignment (Todo App with Persistence)

Create a todo app with data persistence:

- **Requirements:**
  - Create a Todo data model (Identifiable, Codable)
  - Display todos in a List
  - Add ability to create, edit, and delete todos
  - Save todos to UserDefaults
  - Load todos on app launch
  - Add search functionality
  - Use proper list styling

- **Deliverable:** Complete Xcode project with persistence
- **Bonus:** Add sections for completed/uncompleted todos

### Quiz Questions

**Multiple Choice:**

1. What protocol makes items work directly in List?
   a) Codable
   b) Identifiable ✓
   c) Hashable
   d) Equatable

2. How do you iterate in a List?
   a) For loop
   b) ForEach ✓
   c) While loop
   d) Map

3. What is UserDefaults used for?
   a) Complex data
   b) Simple persistence ✓
   c) Networking
   d) Images

4. What does Identifiable require?
   a) name property
   b) id property ✓
   c) value property
   d) data property

5. How do you add swipe actions to List rows?
   a) .swipeActions() ✓
   b) .swipe()
   c) .actions()
   d) .gesture()

6. What is Core Data used for?
   a) Simple data
   b) Complex data persistence ✓
   c) Networking
   d) UI

**Short Answer:**

7. What's the difference between UserDefaults and Core Data?
8. How do you make a List searchable?

### Reading Materials

- Apple's List documentation
- UserDefaults guide
- Core Data programming guide
- Codable protocol documentation

### Resources

- List examples cheat sheet
- UserDefaults template
- Data model examples
- Starter list project

**Next Steps:** Complete exercises and assignment before proceeding to Module 5.

