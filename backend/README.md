# Backend API - Express TypeScript

A backend API template using Express.js with TypeScript, following a popular layered architecture pattern.

## Architecture

The application follows a Layered Architecture pattern:

```
backend/
├── src/
│   ├── config/         # Application configuration
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── routes/         # Route definitions
│   ├── middlewares/    # Express middlewares
│   ├── utils/          # Utilities and helpers
│   ├── types/          # TypeScript types
│   ├── app.ts          # Express configuration
│   └── server.ts       # Server entry point
├── dist/               # Compiled code (generated)
├── .env.example        # Environment variables example
├── nodemon.json        # Nodemon configuration
├── package.json        # NPM dependencies
└── tsconfig.json       # TypeScript configuration
```

## Prerequisites

- Node.js (v20 or higher recommended)
- pnpm (package manager)

## Installation

1. Clone the repository and navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Modify the `.env` file according to your needs.

## Available Scripts

### Development
```bash
pnpm dev
```
Starts the server in development mode with auto-reload (default port 4000).

### Build
```bash
pnpm build
```
Compiles TypeScript code to JavaScript in the `dist/` folder.

### Production
```bash
pnpm start
```
Runs the compiled server (requires `pnpm build` first).

Or directly:
```bash
pnpm start:prod
```
Builds and starts the server.

### Type Checking
```bash
pnpm lint
```
Checks TypeScript types without compiling.

### Clean Build
```bash
pnpm clean
```
Removes the `dist/` folder.

## Available Endpoints

### Root Route
- `GET /` - Welcome message

### Health Check
- `GET /api/health` - Server health check

### Example CRUD
- `GET /api/examples` - List all examples
- `GET /api/examples/:id` - Get example by ID
- `POST /api/examples` - Create new example
- `PUT /api/examples/:id` - Update example
- `DELETE /api/examples/:id` - Delete example

## Code Structure

### Controllers
Controllers handle HTTP requests and responses. They use services for business logic.

### Services
Services contain business logic and interact with models/database.

### Middlewares
- `errorHandler`: Centralized error handling
- `notFoundHandler`: 404 route handling

### Utils
- `AppError`: Custom error class
- `asyncHandler`: Wrapper for handling errors in async functions

## Adding New Features

1. Create a new type in `src/types/`
2. Create a service in `src/services/`
3. Create a controller in `src/controllers/`
4. Create routes in `src/routes/`
5. Import routes in `src/routes/index.ts`

## Environment Variables

See `.env.example` for the complete list of supported variables.

## Security

The application uses several security middlewares:
- `helmet`: HTTP security headers
- `cors`: CORS configuration
- `compression`: Response compression

## Logging

In development mode, HTTP logs are displayed with Morgan.

## Notes

- This template is ready to be extended with a database (MongoDB, PostgreSQL, etc.)
- The provided examples use an in-memory implementation for demonstration
- Add your preferred ORM/ODM and connect it in the services 