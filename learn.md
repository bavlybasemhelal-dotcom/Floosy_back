# Floosy API Documentation

Welcome to the Floosy API documentation. This document covers all available endpoints, request structures, and response formats for the Floosy backend.

---

## 1. Authentication

### POST `/api/auth/signup`
**Description:** Create a new user account.
**Auth Required:** No

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Responses:**
- 400 → Validation error (e.g., email already exists, missing fields)
- 500 → Internal server error

### POST `/api/auth/login`
**Description:** Authenticate a user and receive a JWT token.
**Auth Required:** No

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Responses:**
- 401 → Invalid credentials
- 400 → Missing email or password

---

## 2. User Profile

### GET `/api/users/me`
**Description:** Get current user's profile details.
**Auth Required:** Yes

**Success Response:**
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "New York, USA",
    "profilePictureUrl": "https://supabase.co/storage/v1/object/public/avatars/65f1a2b3c4d5e6f7a8b9c0d1/avatar.jpg"
  }
}
```

### PUT `/api/users/me`
**Description:** Update current user's profile details.
**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+9876543210",
  "location": "London, UK",
  "profilePictureUrl": "https://new-image-url.com"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Updated",
    "email": "john@example.com",
    "phone": "+9876543210",
    "location": "London, UK"
  }
}
```

---

## 3. User Statistics & Gamification

### GET `/api/user-stats`
**Description:** Get current user's experience points, level, coins, and streak.
**Auth Required:** Yes

**Success Response:**
```json
{
  "success": true,
  "message": "Stats retrieved",
  "data": {
    "xp": 1250,
    "coins": 450,
    "level": 3,
    "streak": 5,
    "hasUsedTrial": false,
    "isPremium": false
  }
}
```

### PUT `/api/user-stats`
**Description:** Update user stats (e.g., increment XP after a check-in).
**Auth Required:** Yes

**Request Body:**
```json
{
  "xp": 1300,
  "coins": 460
}
```

---

## 4. Expenses

### GET `/api/expenses`
**Description:** List user's expenses with pagination and filtering.
**Auth Required:** Yes

**Query Params:**
- `page=1&limit=10` → Pagination
- `category=Food` → Filter by category
- `from=2024-01-01&to=2024-01-31` → Date range filter

**Success Response:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [...],
    "total": 45,
    "page": 1,
    "totalPages": 5
  }
}
```

### POST `/api/expenses`
**Description:** Create a new expense.
**Auth Required:** Yes

**Request Body:**
```json
{
  "amount": 25.5,
  "category": "Food",
  "date": "2024-03-15T10:00:00Z",
  "note": "Lunch at work"
}
```

### PUT `/api/expenses/:id`
**Description:** Update an existing expense.
**Auth Required:** Yes

### DELETE `/api/expenses/:id`
**Description:** Delete an expense.
**Auth Required:** Yes

---

## 5. Wallet & Transactions

### GET `/api/wallet/summary`
**Description:** Get user's current wallet balance and settings.
**Auth Required:** Yes

**Success Response:**
```json
{
  "success": true,
  "data": {
    "balance": 1500.75,
    "currency": "USD"
  }
}
```

### GET `/api/wallet`
**Description:** List all wallet transactions.
**Auth Required:** Yes

### POST `/api/wallet`
**Description:** Create a new transaction (Income/Expense).
**Auth Required:** Yes

**Request Body:**
```json
{
  "title": "Salary Deposit",
  "amount": 3000,
  "type": "income",
  "date": "2024-03-01T09:00:00Z"
}
```

---

## 6. Goals

### GET `/api/goals`
**Description:** List user's saving goals.
**Auth Required:** Yes

### POST `/api/goals`
**Description:** Create a new saving goal.
**Auth Required:** Yes

**Request Body:**
```json
{
  "title": "New Laptop",
  "targetAmount": 1200,
  "currentAmount": 200,
  "deadline": "2024-12-31T23:59:59Z"
}
```

---

## 7. Challenges

### GET `/api/challenges`
**Description:** List user's active challenges.
**Auth Required:** Yes

### PUT `/api/challenges/:id/checkin`
**Description:** Perform a manual check-in for a challenge.
**Auth Required:** Yes

**Success Response:**
```json
{
  "success": true,
  "message": "Check-in successful! +50 XP",
  "data": { ... }
}
```

---

## 8. Subscriptions

### GET `/api/subscription/status`
**Description:** Check user's current subscription plan and expiry.
**Auth Required:** Yes

### POST `/api/subscription/activate`
**Description:** Activate a premium or elite plan.
**Auth Required:** Yes

**Request Body:**
```json
{
  "plan": "premium",
  "cycle": "monthly"
}
```

### POST `/api/subscription/trial`
**Description:** Activate a 7-day free trial.
**Auth Required:** Yes

### POST `/api/subscription/cancel`
**Description:** Cancel current active subscription.
**Auth Required:** Yes

---

## 9. Shared Wallet & Activity Logs

### GET `/api/activity-logs`
**Description:** List activity logs for a shared wallet.
**Auth Required:** Yes

### POST `/api/shared-members`
**Description:** Add a new member to a shared wallet.
**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "Jane Doe",
  "contact": "jane@example.com",
  "relationship": 1
}
```

---

## 10. Notifications

### GET `/api/notifications`
**Description:** List user's notifications.
**Auth Required:** Yes

### PUT `/api/notifications/:id/read`
**Description:** Mark a specific notification as read.
**Auth Required:** Yes

### PUT `/api/notifications/read/all`
**Description:** Mark all notifications as read.
**Auth Required:** Yes

---

## 11. Custom Dashboard

### GET `/api/dashboard-widgets`
**Description:** Get user's custom dashboard configuration.
**Auth Required:** Yes

### PUT `/api/dashboard-widgets`
**Description:** Update dashboard widget selection and layout.
**Auth Required:** Yes

**Request Body:**
```json
{
  "selectedWidgets": ["balanceCard", "recentTransactions", "goalsProgress"],
  "tier": "pro"
}
```

---

## 12. Miscellaneous

### POST `/api/upload/save-url`
**Description:** Save a Supabase image URL to the user's profile.
**Auth Required:** Yes

**Request Body:**
```json
{
  "imageUrl": "https://supabase.co/...",
  "type": "profile"
}
```

### GET `/api/insights`
**Description:** Get AI-generated financial insights.
**Auth Required:** Yes

### GET `/api/product-offers`
**Description:** List available marketplace offers.
**Auth Required:** Yes

### POST `/api/support-requests`
**Description:** Submit a help center request.
**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "type": "Bug Report",
  "message": "The app crashes when I add an expense."
}
```

---

*Note: All endpoints return a standard JSON structure with `success`, `message`, and `data` fields.*
