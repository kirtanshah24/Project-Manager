# Backend API Setup

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or cloud instance)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the backend directory with the following content:
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/project-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

Or run the setup script:
```bash
node setup-env.js
```

### 3. Create Test User
Run the following command to create a test user:
```bash
npm run create-test-user
```

This will create a user with:
- Email: `test@example.com`
- Password: `password123`

### 4. Start the Server
```bash
npm run dev
```

The server will start on `http://localhost:4000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Login Request Format
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Login Response Format
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com",
      ...
    },
    "token": "jwt_token_here"
  }
}
```

## Testing the API

You can test the login API using curl:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
``` 