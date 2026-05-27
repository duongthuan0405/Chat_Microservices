# Auth Service

A .NET 10 authentication microservice with JWT token support and user profile management.

## Features

- **User Registration** - Create new user accounts with email and password
- **User Login** - Authenticate users and issue JWT tokens
- **JWT Token Decode** - Validate and extract claims from JWT tokens
- **User Profiles** - Store extended user information (name, phone, avatar, gender)
- **PostgreSQL Persistence** - Persistent user data storage with EF Core

## Prerequisites

- .NET SDK 10.0 or higher
- PostgreSQL 15 (or use Neon PostgreSQL)
- Docker & Docker Compose (optional)

## Configuration

### Connection String

Set the connection string via environment variable or `appsettings.json`:

```csharp
// Environment variable
$env:ConnectionStrings__DefaultConnection = 'Host=localhost;Port=5432;Database=authdb;Username=auth;Password=authpassword'

// Or update appsettings.Development.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=authdb;Username=auth;Password=authpassword"
  }
}
```

## Run Locally

### 1. Start PostgreSQL

```bash
# Option A: Use local Postgres
# Ensure Postgres is running on localhost:5432 with credentials: auth / authpassword

# Option B: Start with Docker
docker run -d \
  --name auth-postgres \
  -e POSTGRES_USER=auth \
  -e POSTGRES_PASSWORD=authpassword \
  -e POSTGRES_DB=authdb \
  -p 5432:5432 \
  postgres:15-alpine
```

### 2. Run the app

```bash
dotnet run
```

The app will:
- Apply pending EF migrations automatically
- Start on `http://localhost:5073`

## Run with Docker Compose

```bash
# Build and start all services
docker compose up --build

# Stop services
docker compose down -v
```

The compose stack includes:
- `auth-service` on `localhost:5073`
- `postgres` database service

## API Endpoints

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-05-30T12:34:56.789Z"
}
```

### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** Same as register

### Decode Token

```http
POST /auth/decode
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-05-30T12:34:56.789Z"
}
```

### Get User Profile

```http
GET /profile/{userId}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "avatarUrl": "https://example.com/avatar.jpg",
  "createdAt": "2026-05-27T10:00:00Z",
  "updatedAt": "2026-05-27T10:00:00Z",
  "gender": "Male"
}
```

### Update User Profile

```http
PUT /profile/{userId}
Content-Type: application/json

{
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "avatarUrl": "https://example.com/avatar.jpg",
  "gender": "Male"
}
```

**Response:** Same as Get User Profile

## Testing

Use the provided `.http` file for REST Client testing in VS Code:

1. Open `auth-service.http`
2. Install the REST Client extension if not already installed
3. Click "Send Request" above each request

Or use `curl`:

```bash
# Register
curl -X POST http://localhost:5073/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123!"}'

# Login
curl -X POST http://localhost:5073/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123!"}'
```

## Database Migrations

View and manage EF Core migrations:

```bash
# List applied migrations
dotnet ef migrations list

# Add new migration
dotnet ef migrations add MigrationName

# Update database to latest migration
dotnet ef database update

# Revert to specific migration
dotnet ef database update PreviousMigration
```

## Project Structure

```
auth-service/
├── AuthService.cs              # Core authentication logic
├── Program.cs                  # ASP.NET app entry point
├── Dockerfile                  # Docker build configuration
├── docker-compose.yml          # Local development stack
├── Data/
│   └── AuthDbContext.cs        # EF Core DbContext
├── Models/
│   └── UserAccount.cs          # User entity
└── Migrations/
    └── [migration files]       # EF Core migrations
```
