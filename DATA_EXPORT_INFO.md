# Data Export Information

## What Data is Exported?

When you download your data (via GDPR & Data settings), the following information is exported in a JSON file:

### 1. **User Account Information**
```json
{
  "user": {
    "name": "Your full name",
    "email": "your.email@example.com"
  }
}
```

### 2. **Profile Information**
- Bio/About section
- Profile picture URL (if uploaded)
- Social media links:
  - Website
  - LinkedIn
  - GitHub
  - Twitter/X
  - Instagram
  - Facebook

### 3. **Learning Progress**
```json
{
  "progress": {
    "completedModules": ["module_id_1", "module_id_2", ...],
    "quizScores": {
      "quiz_id": {
        "score": 85,
        "total": 100,
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    }
  }
}
```

### 4. **Certificates**
- All certificates earned
- Certificate details:
  - Course name
  - Completion date
  - Certificate ID
  - Grade/Score

### 5. **Social Connections**
- List of friends/followers
- Friend relationships (mutual connections)

### 6. **Preferences**
```json
{
  "preferences": {
    "theme": "light" or "dark",
    "visualTheme": "default" or other theme name,
    "uiLayout": "grid" or other layout name
  }
}
```

### 7. **Metadata**
- Export date and timestamp
- Format: ISO 8601 (e.g., "2024-01-15T10:30:00.000Z")

## What is NOT Exported?

The following data is **NOT** included in the export:

- **Passwords** (never stored, only hashed)
- **Messages/Conversations** (stored separately, can be requested separately)
- **Assignment submissions** (stored separately, can be requested separately)
- **Search history** (temporary data)
- **Session tokens** (temporary)
- **IP addresses** (not stored)
- **Browser information** (not stored)

## File Format

- **Format**: JSON (JavaScript Object Notation)
- **Encoding**: UTF-8
- **File Name**: `school2-data-export-{email}-{timestamp}.json`
- **Example**: `school2-data-export-user@example.com-1705312200000.json`

## How to Use the Exported Data

1. **View**: Open the JSON file in any text editor or JSON viewer
2. **Import**: Currently, manual import is not supported. Contact support if you need to restore data.
3. **Backup**: Keep this file as a backup of your data
4. **Privacy**: This file contains personal information - keep it secure!

## GDPR Compliance

- ✅ Right to access: You can download all your data
- ✅ Right to portability: Data is in a machine-readable format (JSON)
- ✅ Right to deletion: You can request deletion of all your data
- ✅ Data minimization: Only necessary data is collected and exported

## Questions?

If you have questions about what data is exported or need additional data, please contact support or use the GDPR settings to request specific data.

