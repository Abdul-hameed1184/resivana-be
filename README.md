# Resivana Backend API

A comprehensive real estate platform backend API built with Node.js, Express, PostgreSQL, and Prisma. Resivana provides a complete solution for property listings, agent management, bookings, messaging, and payments in the real estate industry.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [Core Modules](#core-modules)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Resivana is a production-ready real estate backend platform that connects property buyers, sellers, and agents. The platform provides a robust API for managing property listings, facilitating transactions, enabling communication between users, and handling payments seamlessly.

Built with PostgreSQL and Prisma ORM for type-safe database operations and Jest for comprehensive unit testing.

## ✨ Features

### Property Management

- **Property Listings**: Create, update, and delete property listings with detailed information
- **Property Types**: Support for Apartments, Houses, Land, Commercial properties, and Vehicles
- **Rich Property Data**: Includes price, location, amenities, bedrooms, bathrooms, images, and status tracking
- **Featured Properties**: Highlight premium properties on the platform
- **Property Search & Filtering**: Advanced filtering by type, price, location, status, and availability
- **Location Management**: Geographic coordinates for map integration

### User Management

- **User Roles**: Multi-role system (USER, AGENT, ADMIN)
- **User Profiles**: Comprehensive user profiles with profile pictures and online status
- **Profile Management**: Update user information and profile pictures
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Friends System**: Build connections within the platform

### Agent Management

- **Agent Profiles**: Dedicated agent management with banking information
- **Agent Dashboard**: Manage listings and client interactions
- **Agent Credentials**: Store bank details for payment processing
- **Agent Indexing**: Optimized queries for agent lookups

### Booking System

- **Property Bookings**: Users can book properties for viewing or purchase
- **Booking Status Tracking**: PENDING, APPROVED, DECLINED statuses
- **Booking History**: Complete booking records for users and agents
- **Automatic Timestamps**: Track creation and update times

### Messaging & Chat

- **Real-time Messaging**: Chat between users about properties
- **Conversation Management**: Create and manage conversations
- **Message History**: Full message history storage with timestamps
- **Message Types**: Support for PAYMENT and MESSAGE types
- **Conversation Participants**: Multi-user conversations

### Reviews & Ratings

- **Property Reviews**: Users can leave reviews and ratings for properties
- **Unique Reviews**: Prevent duplicate reviews per property per user
- **Rating System**: 0-5 star rating system
- **Review Management**: Display reviews on property profiles

## 🛠 Tech Stack

### Backend Framework

- **Node.js**: JavaScript runtime (v14+)
- **Express.js**: Web application framework
- **TypeScript**: Typed JavaScript for better development experience

### Database & ORM

- **PostgreSQL**: Relational database
- **Prisma**: Type-safe ORM with migrations
- **pg**: PostgreSQL client for Node.js

### Authentication & Security

- **JWT**: JSON Web Tokens for stateless authentication
- **bcrypt**: Password hashing and encryption with 10 salt rounds
- **CORS**: Cross-Origin Resource Sharing for frontend integration

### Testing

- **Jest**: Testing framework
- **ts-jest**: TypeScript preprocessor for Jest
- **Supertest**: HTTP assertion library for API testing

### Development

- **ts-node-dev**: TypeScript development server with auto-reload
- **TypeScript**: Type checking and compilation
- **tsx**: TypeScript executor for scripts

### Utilities

- **Dotenv**: Environment variable management
- **Express v5**: Latest Express version

## 📁 Project Structure

```
resivana-be/
├── src/
│   ├── server.ts                   # Application entry point
│   ├── script.ts                   # Database seeding script
│   ├── api/
│   │   └── v1/
│   │       ├── controllers/        # Request handlers and business logic
│   │       │   ├── agent.controller.ts
│   │       │   ├── auth.controller.ts
│   │       │   ├── booking.controller.ts
│   │       │   ├── conversation.controller.ts
│   │       │   ├── message.controller.ts
│   │       │   ├── property.controller.ts
│   │       │   ├── review.controller.ts
│   │       │   └── user.controller.ts
│   │       ├── middleware/         # Express middleware
│   │       │   ├── auth.middleware.ts
│   │       │   └── errorHandler.middleware.ts
│   │       ├── modules/            # Business logic modules
│   │       └── routes/
│   │           ├── index.ts
│   │           ├── agent.route.ts
│   │           ├── auth.route.ts
│   │           ├── booking.route.ts
│   │           ├── conversation.route.ts
│   │           ├── message.route.ts
│   │           ├── property.route.ts
│   │           ├── review.route.ts
│   │           └── user.route.ts
│   ├── config/                     # Configuration files
│   ├── lib/
│   │   └── prisma.ts              # Prisma client singleton
│   ├── __tests__/                 # Test files
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   └── types/                      # TypeScript type definitions
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
├── jest.config.ts                 # Jest configuration
├── tsconfig.json                  # TypeScript configuration
├── .env.example                   # Example environment variables
├── .env                           # Local environment variables (gitignored)
├── .gitignore                     # Git ignore rules
├── package.json                   # Project dependencies and scripts
└── README.md                       # This file
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v14 or higher ([Download](https://nodejs.org/))
- **npm** v6 or higher (comes with Node.js)
- **PostgreSQL** v12 or higher ([Download](https://www.postgresql.org/download/))
- **Git** for version control

### Verify Installations

```bash
node --version
npm --version
psql --version
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/resivana-be.git
cd resivana-be
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Environment Variables](#environment-variables) section)

### 4. Set Up PostgreSQL Database

```bash
# Create a new database
createdb resivana_db

# Or using psql
psql -U postgres
CREATE DATABASE resivana_db;
\q
```

### 5. Run Prisma Migrations

```bash
npx prisma migrate dev --name init
```

This will:

- Run all migrations from the `prisma/migrations` folder
- Generate the Prisma Client
- Optionally seed your database

### 6. Generate Prisma Client

```bash
npx prisma generate
```

### 7. Seed the Database (Optional)

```bash
npm run seed
```

### 8. Start the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:5000` (or your configured PORT)

## 🗄️ Database Setup

### PostgreSQL Installation

**Windows:**

1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Set password for postgres user
4. Use default port 5432

**macOS (using Homebrew):**

```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### Connect to PostgreSQL

```bash
# Connect with default postgres user
psql -U postgres

# Create a new user for the project
CREATE USER resivana_user WITH PASSWORD 'your_secure_password';

# Grant privileges
ALTER ROLE resivana_user CREATEDB;

# Create database
CREATE DATABASE resivana_db OWNER resivana_user;

# Connect to the database
\c resivana_db

# Quit
\q
```

### Database Visualization

View your database schema using Prisma Studio:

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can browse and edit your data.

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://resivana_user:your_secure_password@localhost:5432/resivana_db"

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Cloudinary (Optional - for image uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Payment Gateway (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id

# Email Service (Optional)
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Development vs Production

For **production**, use stronger values:

```env
NODE_ENV=production
JWT_SECRET=generate_with_crypto.randomBytes(32).toString('hex')
```

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🏃 Running the Server

### Development Mode (Auto-reload)

```bash
npm run dev
```

Features:

- Hot reload on file changes
- Source maps for debugging
- Detailed error messages

### Build for Production

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` folder.

### Start Production Server

```bash
npm start
```

Runs the compiled JavaScript from `dist/server.js`

### Seed Database

```bash
npm run seed
```

Populates database with test data using the script in `src/script.ts`

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

Automatically reruns tests when files change.

### Coverage Report

```bash
npm run test:cov
```

Generates a coverage report showing:

- Statements covered
- Branches covered
- Functions covered
- Lines covered

### Jest Configuration

Tests are configured in `jest.config.ts`:

- Test environment: Node.js
- TypeScript support via ts-jest
- Test file pattern: `**/__tests__/**/*.test.ts`
- Coverage thresholds: Configurable

### Writing Tests

**Example Unit Test:**

```typescript
// src/__tests__/unit/user.test.ts
describe("User Service", () => {
  it("should create a new user", () => {
    const user = { email: "test@example.com", firstName: "John" };
    expect(user.email).toBe("test@example.com");
  });
});
```

**Example Integration Test:**

```typescript
// src/__tests__/integration/api.test.ts
import request from "supertest";
import app from "../../server";

describe("Properties API", () => {
  it("GET /api/v1/properties should return properties", async () => {
    const response = await request(app).get("/api/v1/properties").expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

## 📡 API Endpoints

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

```
POST   /auth/register           # Register a new user
POST   /auth/login              # User login
POST   /auth/logout             # User logout
GET    /auth/me                 # Get current user
```

### User Endpoints

```
GET    /users                   # Get all users
GET    /users/:id               # Get user by ID
PUT    /users/:id               # Update user profile
DELETE /users/:id               # Delete user account
GET    /users/:id/friends       # Get user's friends
```

### Property Endpoints

```
GET    /properties              # Get all properties (with filtering)
GET    /properties/:id          # Get property details
POST   /properties              # Create new property (agent only)
PUT    /properties/:id          # Update property
DELETE /properties/:id          # Delete property
GET    /properties/search       # Search and filter properties
```

### Agent Endpoints

```
GET    /agents                  # Get all agents
GET    /agents/:id              # Get agent profile
POST   /agents                  # Register as agent
PUT    /agents/:id              # Update agent profile
```

### Booking Endpoints

```
GET    /bookings                # Get user bookings
POST   /bookings                # Create new booking
GET    /bookings/:id            # Get booking details
PUT    /bookings/:id            # Update booking status
DELETE /bookings/:id            # Cancel booking
```

### Conversation Endpoints

```
GET    /conversations           # Get user conversations
POST   /conversations           # Create new conversation
GET    /conversations/:id       # Get conversation details
```

### Message Endpoints

```
GET    /messages/conversation/:id  # Get messages in conversation
POST   /messages                    # Send message
DELETE /messages/:id                # Delete message
```

### Review Endpoints

```
GET    /reviews                 # Get reviews (filterable)
POST   /reviews                 # Create review
GET    /reviews/:id             # Get review details
PUT    /reviews/:id             # Update review
DELETE /reviews/:id             # Delete review
```

## 🗄️ Core Modules

### Controllers

Business logic handlers for each domain:

- **User Controller**: User registration, profile management, auth
- **Property Controller**: CRUD operations for properties
- **Agent Controller**: Agent registration and management
- **Booking Controller**: Booking creation and status management
- **Conversation Controller**: Chat conversation management
- **Message Controller**: Message sending and retrieval
- **Review Controller**: Review creation and management

### Middleware

- **auth.middleware.ts**: JWT verification for protected routes
- **errorHandler.middleware.ts**: Global error handling

### Services

- Database queries via Prisma ORM
- Business logic implementation
- External API integrations

## 🗄️ Database Models

### User

- User accounts, authentication, profiles
- Roles: USER, AGENT, ADMIN
- Relationships: Properties, Bookings, Messages, Reviews, Friends

### Property

- Real estate listings
- Types: APARTMENT, HOUSE, LAND, COMMERCIAL, CAR
- Status: AVAILABLE, PENDING, SOLD
- Relationships: Agent, Location, Bookings, Conversations, Reviews

### Agent

- Agent profiles with banking credentials
- One-to-one relationship with User (USER with AGENT role)

### Location

- Geographic data for properties
- Latitude/longitude for mapping
- City, state, country information

### Booking

- Property viewing/purchase bookings
- Status tracking: PENDING, APPROVED, DECLINED
- Customer and Agent references

### Conversation

- Chat conversations between users
- Optional property reference
- Multiple participants

### Message

- Individual messages in conversations
- Types: PAYMENT, MESSAGE
- Sender and timestamp tracking

### Review

- Ratings and comments for properties
- Unique constraint per user per property

## 🔐 Authentication

### JWT Implementation

1. **Registration/Login**: User credentials are verified
2. **Token Generation**: JWT token is created with user ID and role
3. **Token Storage**: Token sent to client (stored in cookies/localStorage)
4. **Protected Routes**: Token verified on each request
5. **Authorization**: User role checked against required permissions

### Token Structure

```typescript
{
  sub: userId,
  role: "USER" | "AGENT" | "ADMIN",
  iat: issuedAt,
  exp: expiration
}
```

### Secure Endpoints

Include JWT in request header:

```
Authorization: Bearer <your-jwt-token>
```

Or in cookies (automatically handled):

```
Cookie: authToken=<jwt-token>
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**

   ```bash
   click Fork on GitHub
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**

   ```bash
   git commit -m 'Add amazing feature'
   ```

4. **Push to your branch**

   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Include screenshots if applicable

### Code Standards

- Use TypeScript types
- Follow existing code structure
- Write tests for new features
- Update documentation
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 🆘 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U postgres -d resivana_db

# Reset migrations (careful in development only)
npx prisma migrate reset
```

### Port Already in Use

```bash
# Change PORT in .env or terminate process using port 5000
# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### TypeScript Compilation Errors

```bash
npm run build
```

### Test Failures

```bash
# Run with verbose output
npm test -- --verbose

# Run specific test file
npm test -- user.test.ts
```

---

**Built with ❤️ by Resivana Team**

For issues, questions, or suggestions, please:

- Open an issue on GitHub
- Contact the development team
- Check existing documentation

**Last Updated**: April 2, 2026
