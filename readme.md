# Texas Holdem

A modern, full-stack Texas Hold'em poker application with real-time gameplay capabilities.

## Project Overview

This project is a complete Texas Hold'em poker platform built with a microservices architecture. It allows players to join poker tables, play games with real-time interactions, and manage their accounts.

## Architecture

The project is structured as a monorepo using pnpm workspaces with three main applications:

- **Client**: A modern React-based frontend application
- **API Server**: A RESTful API server for user authentication and data management
- **Game Server**: A dedicated server for real-time poker game logic and state management

### Shared Packages

- **database-api**: Prisma-based database access layer
- **shared-types**: Common TypeScript types shared across applications
- **auth-service**: Fastify plugin for JWT-based authentication with refresh token support and Socket.IO middleware authentication

## Technologies Used

### Frontend (Client)
- **React 19**: Modern UI library
- **Vite**: Fast build tool and development server
- **TanStack Router**: Type-safe routing
- **TanStack Query**: Data fetching and state management
- **TanStack Form**: Form handling
- **Socket.io Client**: Real-time communication
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type safety across the codebase

### Backend (API Server)
- **Fastify**: High-performance web framework
- **TypeBox**: Runtime type validation
- **Socket.io**: Real-time bidirectional communication
- **Redis**: Caching and pub/sub messaging

### Game Server
- **Node.js**: JavaScript runtime
- **Socket.io**: Real-time game state updates
- **Decimal.js**: Precise numerical calculations for betting
- **Immer**: Immutable state management
- **Toad Scheduler**: Task scheduling for game events

### Database API
- **PostgreSQL**: Primary database
- **Prisma ORM**: Type-safe database access and migrations
- **@prisma/client**: Auto-generated type-safe database client

### Authentication Service
- **@fastify/jwt**: JWT-based authentication for HTTP routes
- **@fastify/cookie**: Cookie management for refresh tokens
- **jsonwebtoken**: JWT handling for WebSocket authentication

## Key Features

- Real-time multiplayer poker gameplay
- User authentication and account management
- Proper poker hand evaluation and betting rounds
- Dealer rotation and blind management
- Responsive design for various device sizes

## Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm package manager
- PostgreSQL database
- Redis server

### Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Set up environment variables (see `.env.example` files in each app directory)
4. Generate Prisma client:
   ```
   pnpm --filter "@texas-holdem/database-api" prisma:generate
   ```
5. Start development servers:
   ```
   pnpm dev
   ```

This will start all three applications in development mode:
- Client: http://localhost:4000
- API Server: http://localhost:3000
- Game Server (Web Socket): http://localhost:3002

## Project Structure

```
texas-holdem/
├── apps/
│   ├── client/           # React frontend
│   ├── api-server/       # Fastify API server
│   └── game-server/      # Game logic server
├── packages/
│   ├── auth-service/     # Authentication service
│   ├── database-api/     # Prisma database layer
│   └── shared-types/     # Common TypeScript types
└── documentation/        # Project documentation
```
