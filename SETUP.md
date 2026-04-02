# Development Setup Guide

Complete step-by-step guide for setting up the Resivana Backend on your local machine.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js v14+ installed
- [ ] PostgreSQL v12+ installed
- [ ] Git installed
- [ ] A code editor (VS Code recommended)
- [ ] ~500MB free disk space

## 1️⃣ Verify Prerequisites

### Check Node.js

```bash
node --version   # Should be v14 or higher
npm --version    # Should be v6 or higher
```

If not installed, download from [nodejs.org](https://nodejs.org/)

### Check PostgreSQL

```bash
psql --version   # Should be v12 or higher
```

**Installation:**

**Windows:**

1. Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run installer
3. Remember the postgres password you set
4. Select port 5432 (default)

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

### Check Git

```bash
git --version   # Should show version
```

## 2️⃣ Clone Repository

```bash
# Navigate to where you want the project
cd ~/Projects  # or your preferred directory

# Clone the repository
git clone https://github.com/yourusername/resivana-be.git

# Enter project directory
cd resivana-be
```

## 3️⃣ Install Dependencies

```bash
# Install all npm dependencies
npm install

# Verify installation
npm list | head -20
```

This installs:

- Express.js, TypeScript, Prisma
- Testing tools (Jest, Supertest)
- Authentication (bcrypt, dotenv)
- And more...

## 4️⃣ Setup PostgreSQL Database

### Create Database User

```bash
# Open PostgreSQL prompt
psql -U postgres

# Create a new user (replace your_password with a secure password)
CREATE USER resivana_user WITH PASSWORD 'your_password';

# Grant create database permission
ALTER ROLE resivana_user CREATEDB;

# Exit psql
\q
```

### Create Database

```bash
# Create the database
createdb -U resivana_user resivana_db

# Or using psql
psql -U postgres
CREATE DATABASE resivana_db OWNER resivana_user;
\q
```

### Verify Connection

```bash
# Test the connection
psql -U resivana_user -d resivana_db

# You should see the prompt: resivana_db=>
# Exit with \q
```

## 5️⃣ Configure Environment Variables

### Create .env File

```bash
# Copy the example file
cp .env.example .env
```

### Edit .env File

Open `.env` in your editor and update these values:

**Database Configuration:**

```env
DATABASE_URL="postgresql://resivana_user:your_password@localhost:5432/resivana_db"
```

Replace `your_password` with the password you created earlier.

**JWT Configuration:**

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add to `.env`:

```env
JWT_SECRET=<paste_the_generated_value_here>
JWT_EXPIRE=24h
```

**Other Variables:**

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

## 6️⃣ Run Database Migrations

```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# This will:
# - Create all tables
# - Create indexes
# - Generate Prisma Client
```

### Verify database was created

```bash
# Open Prisma Studio to view database
npx prisma studio

# This opens http://localhost:5555 in your browser
# You can browse all tables and data here
```

## 7️⃣ Seed Database (Optional)

Add test data to database:

```bash
npm run seed
```

This runs `src/script.ts` which creates:

- Test user
- Test agent
- Test properties
- Other test data

## 8️⃣ Start Development Server

```bash
# Start the server with auto-reload
npm run dev

# You should see:
# Server running on http://localhost:5000
```

The server auto-reloads when you change files.

## 9️⃣ Run Tests

```bash
# Run all tests
npm test

# Run in watch mode (auto-rerun on file changes)
npm run test:watch

# Generate coverage report
npm run test:cov
```

## 🔟 Verify Setup

### Test API Endpoint

```bash
# Open new terminal and test the API
curl http://localhost:5000/api/v1/health

# Should return status 200
```

Or use Postman/VS Code REST Client

### Check Logs

In dev terminal, you should see:

```
Connected to PostgreSQL
Server running on http://localhost:5000
```

## 🛠️ Common Tasks

### View Database in SQL Client

**DBeaver** (Recommended):

1. Download from [dbeaver.io](https://dbeaver.io)
2. Create new connection
3. Type: PostgreSQL
4. Host: localhost
5. Port: 5432
6. Database: resivana_db
7. User: resivana_user
8. Password: your_password

**Prisma Studio:**

```bash
npx prisma studio
```

### Rebuild Database

```bash
# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset

# Or start fresh
npx prisma db push
```

### Create New Migration

After schema changes:

```bash
npx prisma migrate dev --name describe_change
```

### Generate Prisma Client

After schema changes:

```bash
npx prisma generate
```

## 🐛 Troubleshooting

### "Cannot connect to database"

Check:

1. PostgreSQL is running: `pg_isready`
2. Database URL in `.env` is correct
3. User and password are correct
4. Database exists: `psql -U resivana_user -d resivana_db`

```bash
# Start PostgreSQL (if stopped)
# Windows: pg_ctl -D "C:\Program Files\PostgreSQL\data" start
# macOS: brew services start postgresql
# Linux: sudo service postgresql start
```

### "Port 5000 already in use"

Find and kill process using port:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Or change PORT in .env to 5001, 5002, etc.
```

### "Cannot find module"

```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Or update packages
npm update
```

### "Prisma Client not found"

```bash
# Regenerate Prisma Client
npx prisma generate
```

### Tests failing

```bash
# Clear Jest cache
npm test -- --clearCache

# Run verbose
npm test -- --verbose
```

## 📚 Next Steps

1. **Read the Main README**: `cat README.md`
2. **Review Testing Guide**: `cat TESTING.md`
3. **Explore Prisma Schema**: `cat prisma/schema.prisma`
4. **Check API Routes**: `ls src/api/v1/routes/`

## 💻 VS Code Setup (Optional but Recommended)

### Extensions to Install

1. **Prisma** - Syntax highlighting for schema.prisma

   ```
   ext install Prisma.prisma
   ```

2. **REST Client** - Make API calls from VS Code

   ```
   ext install humao.rest-client
   ```

3. **Thunder Client** - Alternative to Postman

   ```
   ext install rangav.vscode-thunder-client
   ```

4. **SonarLint** - Code quality
   ```
   ext install SonarSource.sonarlint-vscode
   ```

### Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/ts-node-dev",
      "args": ["--respawn", "--transpile-only", "src/server.ts"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## ✅ Complete Checklist

- [ ] Node.js and npm installed
- [ ] PostgreSQL installed and running
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Database user created
- [ ] Database created
- [ ] .env file configured
- [ ] Database migrations run
- [ ] Seeds applied
- [ ] Development server running
- [ ] Tests passing
- [ ] API responding

## 🎉 Ready to Go!

Your development environment is now set up.

### Quick Commands Reference

```bash
npm run dev          # Start development server
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
npm run build       # Build for production
npm start           # Start production build
npm run seed        # Populate database with test data
npx prisma studio  # View/manage database in browser
npx prisma migrate dev --name <name>  # Create new migration
```

## 📞 Need Help?

- Check **TESTING.md** for testing documentation
- Check **README.md** for API documentation
- Review Prisma docs: [pris.ly/d/prisma-schema](https://pris.ly/d/prisma-schema)
- Search existing issues on GitHub
- Create an issue with detailed description

---

**Last Updated**: April 2, 2026
