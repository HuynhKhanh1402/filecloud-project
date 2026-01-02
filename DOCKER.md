# FileCloud - Docker Setup Guide

This guide explains how to run the FileCloud application using Docker and Docker Compose.

## Prerequisites

- Docker Desktop installed
- Docker Compose installed

## Environment Configuration

The project uses a hierarchical environment configuration:

1. **Root `.env`** - Global configuration for all services
2. **`backend/.env`** - Backend-specific configuration
3. **`frontend/.env`** - Frontend-specific configuration

### Setup Environment Files

1. Copy the example environment files:

```powershell
# Root directory
Copy-Item .env.example .env

# Backend
Copy-Item backend\.env.example backend\.env

# Frontend
Copy-Item frontend\.env.example frontend\.env
```

2. Update the `.env` file in the root directory with your configuration:

```env
# For production
NODE_ENV=production
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000

# For development
NODE_ENV=development
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

## Running the Application

### Development Mode

Development mode includes hot-reloading for both frontend and backend:

```powershell
docker-compose -f docker-compose.dev.yml up --build
```

To run in detached mode:

```powershell
docker-compose -f docker-compose.dev.yml up -d --build
```

**Services Available:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Swagger API Docs: http://localhost:3000/api/docs
- MinIO Console: http://localhost:9001
- PostgreSQL: localhost:5432

### Production Mode

Production mode uses optimized builds:

```powershell
docker-compose up --build
```

To run in detached mode:

```powershell
docker-compose up -d --build
```

## Managing Services

### View Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services

```powershell
# Development
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose down
```

### Stop Services and Remove Volumes

```powershell
# Development
docker-compose -f docker-compose.dev.yml down -v

# Production
docker-compose down -v
```

## Database Management

### Run Migrations

Migrations run automatically when containers start. To run manually:

```powershell
# Enter backend container
docker exec -it filecloud-backend-prod sh

# Run migrations
npx prisma migrate deploy
```

### Access Prisma Studio

```powershell
# Enter backend container
docker exec -it filecloud-backend-prod sh

# Start Prisma Studio
npx prisma studio
```

## MinIO Configuration

MinIO is used for file storage. Access the console at http://localhost:9001

**Default Credentials:**
- Username: `minioadmin`
- Password: `minioadmin`

Change these in the `.env` file for production!

## Network Configuration

Both frontend and backend are configured to bind to `0.0.0.0` instead of `localhost`, making them accessible from outside the container.

## Troubleshooting

### Port Already in Use

If you see port conflicts, change the ports in `.env`:

```env
BACKEND_PORT=3001
FRONTEND_PORT=5174
```

### Database Connection Issues

Ensure PostgreSQL is healthy:

```powershell
docker-compose ps
```

### MinIO Connection Issues

Verify MinIO is running:

```powershell
docker logs filecloud-minio-prod
```

### Rebuild After Code Changes

```powershell
# Development (hot-reload should work)
docker-compose -f docker-compose.dev.yml restart backend

# Production (requires rebuild)
docker-compose up --build -d
```

## Project Structure

```
filecloud-project/
├── .env                      # Global environment variables
├── .env.example              # Example global environment
├── docker-compose.yml        # Production compose file
├── docker-compose.dev.yml    # Development compose file
├── backend/
│   ├── .env                  # Backend environment
│   ├── .env.example          # Example backend environment
│   ├── Dockerfile            # Production backend image
│   └── Dockerfile.dev        # Development backend image
└── frontend/
    ├── .env                  # Frontend environment
    ├── .env.example          # Example frontend environment
    ├── Dockerfile            # Production frontend image
    └── Dockerfile.dev        # Development frontend image
```

## Security Notes

⚠️ **Important for Production:**

1. Change all default passwords in `.env`
2. Use strong JWT secrets
3. Enable SSL for MinIO in production
4. Use environment-specific database credentials
5. Never commit `.env` files to version control
