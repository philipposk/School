# Module 6: Networking & APIs

## Title: Fetching Data from the Internet with URLSession and async/await

### Lecture Content

Most apps need to fetch data from the internet. This module covers how to make network requests, parse JSON, and handle asynchronous operations in SwiftUI.

#### 1. URLSession Basics

**Simple GET Request:**
```swift
let url = URL(string: "https://api.example.com/data")!

URLSession.shared.dataTask(with: url) { data, response, error in
    if let data = data {
        // Handle data
    }
}.resume()
```

**Understanding URLSession:**
- `URLSession.shared` - Default shared session
- `dataTask` - Creates a data task
- `resume()` - Starts the task
- Completion handler receives data, response, and error

#### 2. async/await (Modern Approach)

**Async Function:**
```swift
func fetchData() async throws -> Data {
    let url = URL(string: "https://api.example.com/data")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return data
}
```

**Using in View:**
```swift
@State private var data: Data?

Task {
    do {
        data = try await fetchData()
    } catch {
        print("Error: \(error)")
    }
}
```

#### 3. JSON Parsing with Codable

**Define Model:**
```swift
struct User: Codable {
    let id: Int
    let name: String
    let email: String
}
```

**Decode JSON:**
```swift
func fetchUser() async throws -> User {
    let url = URL(string: "https://api.example.com/user/1")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(User.self, from: data)
}
```

**Array of Objects:**
```swift
struct User: Codable {
    let id: Int
    let name: String
}

func fetchUsers() async throws -> [User] {
    let url = URL(string: "https://api.example.com/users")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode([User].self, from: data)
}
```

#### 4. Error Handling

**Basic Error Handling:**
```swift
enum NetworkError: Error {
    case invalidURL
    case noData
    case decodingError
}

func fetchData() async throws -> Data {
    guard let url = URL(string: "https://api.example.com/data") else {
        throw NetworkError.invalidURL
    }
    
    do {
        let (data, response) = try await URLSession.shared.data(from: url)
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw NetworkError.noData
        }
        return data
    } catch {
        throw NetworkError.decodingError
    }
}
```

**Handling in View:**
```swift
@State private var errorMessage: String?

Task {
    do {
        let data = try await fetchData()
        // Use data
    } catch NetworkError.invalidURL {
        errorMessage = "Invalid URL"
    } catch NetworkError.noData {
        errorMessage = "No data received"
    } catch {
        errorMessage = "Unknown error: \(error.localizedDescription)"
    }
}
```

#### 5. POST Request

**Sending Data:**
```swift
func postData(user: User) async throws {
    let url = URL(string: "https://api.example.com/users")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let encoder = JSONEncoder()
    request.httpBody = try encoder.encode(user)
    
    let (_, response) = try await URLSession.shared.data(for: request)
    // Handle response
}
```

#### 6. Loading States

**Managing Loading State:**
```swift
@State private var isLoading = false
@State private var users: [User] = []
@State private var errorMessage: String?

func loadUsers() async {
    isLoading = true
    errorMessage = nil
    
    do {
        users = try await fetchUsers()
    } catch {
        errorMessage = error.localizedDescription
    }
    
    isLoading = false
}
```

**Displaying Loading State:**
```swift
if isLoading {
    ProgressView("Loading...")
} else if let error = errorMessage {
    Text("Error: \(error)")
} else {
    List(users) { user in
        Text(user.name)
    }
}
```

#### 7. ObservableObject for API Calls

**API Service Class:**
```swift
class APIService: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    func fetchUsers() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let url = URL(string: "https://api.example.com/users")!
            let (data, _) = try await URLSession.shared.data(from: url)
            users = try JSONDecoder().decode([User].self, from: data)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
}
```

**Using in View:**
```swift
@StateObject private var apiService = APIService()

var body: some View {
    List(apiService.users) { user in
        Text(user.name)
    }
    .task {
        await apiService.fetchUsers()
    }
}
```

#### 8. Popular APIs to Practice With

**JSONPlaceholder (Free):**
- `https://jsonplaceholder.typicode.com/users`
- `https://jsonplaceholder.typicode.com/posts`

**OpenWeatherMap (Free tier):**
- `https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY`

**REST Countries:**
- `https://restcountries.com/v3.1/all`

#### 9. URL Components

**Building URLs with Components:**
```swift
var components = URLComponents()
components.scheme = "https"
components.host = "api.example.com"
components.path = "/users"
components.queryItems = [
    URLQueryItem(name: "page", value: "1"),
    URLQueryItem(name: "limit", value: "10")
]

if let url = components.url {
    // Use url
}
```

### Exercises (Complete all 5)

1. Create a function that fetches data from a public API using async/await.
2. Build a Codable model and decode JSON from an API response.
3. Implement error handling for network requests.
4. Create an ObservableObject that fetches and stores API data.
5. Build a view that displays a loading state while fetching data.

### Assignment (API-Integrated App)

Create an app that fetches and displays data from an API:

- **Requirements:**
  - Choose a public API (JSONPlaceholder, REST Countries, etc.)
  - Create Codable models for the API response
  - Fetch data using async/await
  - Display data in a List
  - Show loading state while fetching
  - Handle and display errors
  - Add pull-to-refresh functionality
  - Use proper error handling

- **Deliverable:** Complete Xcode project with API integration
- **Bonus:** Add search/filter functionality for the fetched data

### Quiz Questions

**Multiple Choice:**

1. What is URLSession used for?
   a) Displaying data
   b) Making network requests ✓
   c) Parsing JSON
   d) Storing data

2. What does async/await do?
   a) Makes code synchronous
   b) Handles asynchronous operations ✓
   c) Parses JSON
   d) Creates URLs

3. What protocol is used for JSON parsing?
   a) Identifiable
   b) Codable ✓
   c) Hashable
   d) Equatable

4. How do you start a URLSession task?
   a) .start()
   b) .resume() ✓
   c) .begin()
   d) .execute()

5. What does Task do in SwiftUI?
   a) Creates a view
   b) Runs async code ✓
   c) Parses JSON
   d) Makes requests

6. What is the modern way to handle async code?
   a) Completion handlers
   b) async/await ✓
   c) Closures
   d) Delegates

**Short Answer:**

7. What's the difference between async/await and completion handlers?
8. How do you handle errors in async functions?

### Reading Materials

- Apple's URLSession documentation
- Swift concurrency guide
- Codable protocol documentation
- REST API best practices

### Resources

- API integration cheat sheet
- async/await examples
- JSON parsing templates
- Starter API project

**Next Steps:** Complete exercises and assignment before proceeding to Module 7.

