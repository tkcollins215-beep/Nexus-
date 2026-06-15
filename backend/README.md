# Chat App Backend

Professional chat application backend built with Node.js, Express, and Socket.io

## Features

- User authentication (JWT)
- Real-time messaging with WebSocket
- One-to-one and group conversations
- Message read receipts
- User presence tracking
- Message editing and deletion
- Media sharing support

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/chat_app
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:8081
```

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/auth` - Get all users
- `GET /api/auth/:userId` - Get user by ID
- `PUT /api/auth/:userId` - Update user profile

### Conversations
- `GET /api/conversations` - Get all conversations
- `POST /api/conversations` - Create/get conversation
- `GET /api/conversations/:conversationId` - Get conversation with messages
- `POST /api/conversations/:conversationId/messages` - Send message
- `PUT /api/conversations/:conversationId/read` - Mark messages as read
- `PUT /api/conversations/:conversationId/messages/:messageId` - Edit message
- `DELETE /api/conversations/:conversationId/messages/:messageId` - Delete message

## Socket.io Events

### Client to Server
- `send_message` - Send a new message
- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room
- `typing` - User is typing
- `stop_typing` - User stopped typing
- `message_read` - Message was read

### Server to Client
- `new_message` - New message received
- `user_typing` - User is typing
- `user_stop_typing` - User stopped typing
- `message_read` - Message read by someone
- `user_joined` - User joined conversation
- `user_left` - User left conversation
- `user_online` - User came online
- `user_offline` - User went offline
