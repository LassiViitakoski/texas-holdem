# Source Tree Organization - Texas Hold'em Poker Platform

## Overview

This document provides a comprehensive guide to the codebase organization, helping AI development agents understand where to find specific functionality and how to navigate the project structure.

## Project Structure (Detailed)

```text
texas-holdem/                          # Monorepo root
├── apps/                              # Main applications
│   ├── client/                        # React 19 frontend (Port 4000)
│   │   ├── src/
│   │   │   ├── components/            # React components
│   │   │   │   ├── game/             # 🎯 Poker table UI components
│   │   │   │   │   ├── ActionButtons.tsx    # Player action UI
│   │   │   │   │   ├── CommunityCards.tsx   # Shared cards display
│   │   │   │   │   ├── PokerTable.tsx       # Main table component
│   │   │   │   │   └── TablePosition.tsx    # Player seat component
│   │   │   │   ├── layout/           # App layout components
│   │   │   │   ├── shared/           # Reusable UI components
│   │   │   │   └── ui/               # Base UI primitives (Button, Input)
│   │   │   ├── contexts/             # React contexts
│   │   │   │   └── GameContext.tsx   # Game state context
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   │   ├── useGames.ts       # Game API operations
│   │   │   │   └── useUsers.ts       # User API operations
│   │   │   ├── routes/               # TanStack Router pages
│   │   │   │   ├── games/            # Game-related pages
│   │   │   │   ├── activeGames/      # Active games list
│   │   │   │   └── __root.tsx        # Root layout
│   │   │   ├── services/             # API and Socket services
│   │   │   │   ├── socket.ts         # 🎯 Socket.io client service
│   │   │   │   └── gameSocket.ts     # Game-specific socket events
│   │   │   ├── stores/               # State management
│   │   │   │   └── gameStore.ts      # 🎯 Zustand game state store
│   │   │   └── types/                # Client-specific types
│   │   │       └── game.ts           # Game UI types
│   │   └── vite.config.js            # Vite configuration
│   │
│   ├── api-server/                    # Fastify HTTP API (Port 3000)
│   │   ├── src/
│   │   │   ├── routes/               # HTTP route handlers
│   │   │   │   ├── games/            # 🎯 Game CRUD operations
│   │   │   │   │   ├── handler.ts    # Game route handlers
│   │   │   │   │   ├── index.ts      # Game routes definition
│   │   │   │   │   └── schema.ts     # Game validation schemas
│   │   │   │   └── users/            # User management routes
│   │   │   ├── services/             # Business services
│   │   │   │   └── redis.ts          # 🎯 Redis pub/sub service
│   │   │   ├── plugins/              # Fastify plugins
│   │   │   │   └── cors.ts           # CORS configuration
│   │   │   ├── errors/               # Error handling
│   │   │   │   ├── handler.ts        # Global error handler
│   │   │   │   └── http-mapper.ts    # HTTP status mapping
│   │   │   └── app.ts                # Fastify app setup
│   │   └── routes.md                 # API documentation
│   │
│   └── game-server/                   # Real-time poker engine (Port 3002)
│       ├── src/
│       │   ├── core/                 # 🎯 CORE POKER LOGIC
│       │   │   ├── game/             # Game management
│       │   │   │   ├── game-manager.ts    # 🎯 Singleton managing all games
│       │   │   │   ├── game.ts            # 🎯 Individual game logic
│       │   │   │   └── table-position.ts  # Seating management
│       │   │   ├── player/           # Player state management
│       │   │   │   ├── player.ts          # 🎯 Player game state
│       │   │   │   └── round-player.ts    # Player in specific round
│       │   │   └── round/            # Round management
│       │   │       ├── round.ts           # 🎯 Poker round lifecycle
│       │   │       └── betting-round.ts   # 🎯 Betting phase logic
│       │   ├── models/               # Game models
│       │   │   ├── card.ts           # 🎯 Playing card implementation
│       │   │   └── deck.ts           # 🎯 Deck shuffling and dealing
│       │   ├── services/             # Infrastructure services
│       │   │   ├── socket-manager.ts      # 🎯 WebSocket coordination
│       │   │   ├── message-broker.ts      # 🎯 Redis pub/sub handling
│       │   │   ├── player-registry.ts     # 🎯 Player relationship mapping
│       │   │   └── scheduler.ts           # Game timer management
│       │   └── types/                # Game-specific types
│       │       └── index.ts          # Poker game types
│       └── jest.config.mjs           # Test configuration
│
├── packages/                          # Shared libraries
│   ├── auth-service/                  # JWT authentication
│   │   ├── src/
│   │   │   ├── core/                 # Authentication core
│   │   │   │   └── token-service.ts  # JWT token management
│   │   │   ├── middleware/           # Auth middleware
│   │   │   │   ├── fastify.middleware.ts   # Fastify auth middleware
│   │   │   │   └── socketio.middleware.ts  # Socket.io auth middleware
│   │   │   └── plugins/              # Authentication plugins
│   │   │       └── fastify-auth.plugin.ts  # Fastify auth plugin
│   │   └── package.json
│   │
│   ├── database-api/                  # Prisma database layer
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # 🎯 COMPLETE DATA MODEL
│   │   │   └── migrations/           # 32 database migrations
│   │   ├── src/
│   │   │   ├── repositories/         # Repository pattern implementation
│   │   │   │   ├── game.repository.ts           # Game CRUD operations
│   │   │   │   ├── player.repository.ts         # Player management
│   │   │   │   ├── round.repository.ts          # Round lifecycle
│   │   │   │   ├── betting-round.repository.ts  # Betting operations
│   │   │   │   └── user.repository.ts           # User management
│   │   │   └── core/
│   │   │       └── database.service.ts     # Database service wrapper
│   │   └── package.json
│   │
│   └── shared-types/                  # Common TypeScript types
│       ├── src/
│       │   └── index.ts              # 🎯 Shared type definitions
│       └── package.json
│
├── docs/                              # BMad documentation
│   ├── architecture.md               # Main architecture document
│   ├── architecture/                 # Sharded architecture components
│   ├── prd.md                       # Product requirements
│   ├── epics/                       # Epic definitions
│   └── stories/                     # User stories
│
└── archive/                          # Historical documentation
    ├── database/                     # Original database design
    └── system-design.drawio          # Original system diagrams
```

## Key File Locations by Functionality

### 🎯 Critical Entry Points
- **Client App**: `apps/client/src/main.tsx`
- **API Server**: `apps/api-server/src/index.ts`
- **Game Server**: `apps/game-server/src/index.ts`
- **Database Schema**: `packages/database-api/prisma/schema.prisma`

### 🎯 Core Business Logic
- **Game Manager**: `apps/game-server/src/core/game/game-manager.ts` (Singleton managing all games)
- **Individual Game**: `apps/game-server/src/core/game/game.ts` (Single game instance)
- **Round Logic**: `apps/game-server/src/core/round/round.ts` (Poker round management)
- **Betting Logic**: `apps/game-server/src/core/round/betting-round.ts` (Betting phases)
- **Player State**: `apps/game-server/src/core/player/player.ts` (Player in game)

### 🎯 Real-time Architecture
- **Socket Manager**: `apps/game-server/src/services/socket-manager.ts` (WebSocket coordination)
- **Message Broker**: `apps/game-server/src/services/message-broker.ts` (Redis pub/sub)
- **Client Socket**: `apps/client/src/services/socket.ts` (Client-side Socket.io)
- **Game Store**: `apps/client/src/stores/gameStore.ts` (Client state management)

### 🎯 Data Layer
- **Repositories**: `packages/database-api/src/repositories/` (All data operations)
- **Database Service**: `packages/database-api/src/core/database.service.ts` (DB connection)
- **Shared Types**: `packages/shared-types/src/index.ts` (Common interfaces)

### 🎯 Authentication
- **Token Service**: `packages/auth-service/src/core/token-service.ts` (JWT handling)
- **Auth Middleware**: `packages/auth-service/src/middleware/` (Request validation)
- **Auth Plugins**: `packages/auth-service/src/plugins/` (Fastify integration)

## Navigation Patterns for AI Agents

### Working on Game Logic
1. Start with: `apps/game-server/src/core/game/game-manager.ts`
2. Understand: `apps/game-server/src/core/game/game.ts`
3. Dive into: `apps/game-server/src/core/round/` for specific phases
4. Check models: `apps/game-server/src/models/` for card logic

### Working on Real-time Features
1. Server-side: `apps/game-server/src/services/socket-manager.ts`
2. Client-side: `apps/client/src/services/socket.ts`
3. State sync: `apps/client/src/stores/gameStore.ts`
4. UI updates: `apps/client/src/components/game/`

### Working on API Features
1. Routes: `apps/api-server/src/routes/`
2. Validation: Look for `schema.ts` files in route folders
3. Database: `packages/database-api/src/repositories/`
4. Types: `packages/shared-types/src/index.ts`

### Working on UI Features
1. Components: `apps/client/src/components/`
2. Pages: `apps/client/src/routes/`
3. Hooks: `apps/client/src/hooks/`
4. State: `apps/client/src/stores/` or `apps/client/src/contexts/`

## File Naming Conventions

### TypeScript Files
- **Components**: PascalCase (e.g., `PokerTable.tsx`)
- **Services**: camelCase (e.g., `socket-manager.ts`)
- **Types**: camelCase (e.g., `game.ts`)
- **Repositories**: camelCase with suffix (e.g., `game.repository.ts`)

### Directory Structure
- **Plural for collections**: `components/`, `services/`, `routes/`
- **Singular for single purpose**: `core/`, `middleware/`
- **Descriptive grouping**: `game/`, `player/`, `round/`

## Import Patterns

### Workspace Packages
```typescript
// Shared packages
import { GameStatus } from '@texas-holdem/shared-types';
import { gameRepository } from '@texas-holdem/database-api';
import { authenticateToken } from '@texas-holdem/auth-service';
```

### Internal Imports
```typescript
// Relative imports within same app
import { GameManager } from '../core/game/game-manager';
import { SocketManager } from '../services/socket-manager';
```

---

*This guide should be updated when significant structural changes are made to the codebase.*
