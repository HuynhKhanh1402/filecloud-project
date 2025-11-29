# FileCloud Backend

This is the backend API for FileCloud, a file storage and management application built with NestJS.

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **Prisma ORM** - Next-generation ORM for Node.js and TypeScript
- **PostgreSQL** - Relational database
- **MinIO** - High-performance object storage

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for local development)

## Getting Started

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

Environment variables:

- `NODE_ENV` - Application environment (development/production)
- `PORT` - Application port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- `MINIO_ENDPOINT` - MinIO server endpoint
- `MINIO_PORT` - MinIO server port
- `MINIO_USE_SSL` - Use SSL for MinIO connection
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key
- `MINIO_BUCKET_NAME` - MinIO bucket name for file storage

### 3. Start Docker Services

Start PostgreSQL and MinIO using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- MinIO on port 9000 (API) and 9001 (Console)

Access MinIO Console at http://localhost:9001 (credentials: minioadmin/minioadmin)

### 4. Run Database Migrations

Generate Prisma Client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start the Development Server

```bash
npm run start:dev
```

The API will be available at http://localhost:3000

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run build` - Build the application
- `npm run lint` - Lint the code
- `npm run format` - Format the code with Prettier
- `npm test` - Run tests

## Database Management

### Create a new migration

```bash
npx prisma migrate dev --name migration_name
```

### Reset the database

```bash
npx prisma migrate reset
```

### Open Prisma Studio

```bash
npx prisma studio
```

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app.controller.ts   # Main application controller
│   ├── app.module.ts       # Root module
│   ├── app.service.ts      # Main application service
│   ├── main.ts             # Application entry point
│   ├── minio/              # MinIO module
│   │   ├── minio.module.ts
│   │   └── minio.service.ts
│   └── prisma/             # Prisma module
│       ├── prisma.module.ts
│       └── prisma.service.ts
├── docker-compose.yml      # Docker services configuration
├── .env                    # Environment variables (not in git)
├── .env.example            # Environment variables template
└── package.json
```

## API Endpoints

### Health Check

- `GET /` - Welcome message
- `GET /health` - Health check endpoint

## Development

The application uses:
- **Global validation pipe** - Automatic request validation
- **CORS enabled** - Cross-origin resource sharing
- **Global Prisma module** - Database access throughout the app
- **Global MinIO module** - Object storage access throughout the app
