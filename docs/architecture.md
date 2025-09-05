# Texas Hold'em Poker - Brownfield Architecture Document

## Introduction

This document captures the **CURRENT STATE** of the Texas Hold'em poker application codebase, including technical debt, workarounds, and real-world patterns. It serves as a reference for AI agents working on enhancements and future development.

### Document Scope

Comprehensive documentation of entire system with special emphasis on **game logic & real-time architecture** for AI agent consumption.

### Related Documentation

This architecture document is part of a sharded documentation structure:

- **📋 [`tech-stack.md`](./architecture/tech-stack.md)** - Technology decisions, versions, and constraints
- **📋 [`source-tree.md`](./architecture/source-tree.md)** - Code organization and navigation guide  
- **📋 [`coding-standards.md`](./architecture/coding-standards.md)** - Development patterns and conventions
- **📋 [`prd.md`](./prd.md)** - Product requirements and business context
- **📋 [`epics/`](./epics/)** - Epic definitions and stories

### Change Log

| Date       | Version | Description                    | Author    |
|------------|---------|--------------------------------|-----------|
| 2025-09-05 | 1.0     | Initial brownfield analysis    | Winston   | 

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Client Entry**: `apps/client/src/main.tsx` - React 19 app with TanStack Router
- **API Server Entry**: `apps/api-server/src/index.ts` - Fastify HTTP API server
- **Game Server Entry**: `apps/game-server/src/index.ts` - Real-time poker game engine
- **Database Schema**: `packages/database-api/prisma/schema.prisma` - Complete data model
- **Shared Types**: `packages/shared-types/src/index.ts` - Common TypeScript interfaces
- **Game Logic Core**: `apps/game-server/src/core/game/game.ts` - Main poker game class
- **Real-time Manager**: `apps/game-server/src/services/socket-manager.ts` - WebSocket coordination

### Key Business Logic Files

- **Game Manager**: `apps/game-server/src/core/game/game-manager.ts` - Singleton managing all active games
- **Round Logic**: `apps/game-server/src/core/round/round.ts` - Poker round management
- **Betting Rounds**: `apps/game-server/src/core/round/betting-round.ts` - Betting logic per phase
- **Player Actions**: `apps/game-server/src/core/player/player.ts` - Player state management
- **Card Engine**: `apps/game-server/src/models/deck.ts` - Card dealing and shuffling

## High Level Architecture

### Executive Summary

Texas Hold'em is a **real-time multiplayer poker platform** built as a **microservices monorepo** using modern TypeScript technologies. The system separates concerns into three main applications with shared packages, emphasizing **real-time game synchronization** and **precise monetary calculations**.

### System Architecture Overview

```
┌─────────────────┐    HTTP/REST     ┌─────────────────┐    Redis Pub/Sub    ┌─────────────────┐
│                 │ ◄──────────────► │                 │ ◄─────────────────► │                 │
│   React Client  │                  │   API Server    │                     │   Game Server   │
│   (Port 4000)   │                  │   (Port 3000)   │                     │   (Port 3002)   │
│                 │                  │                 │                     │                 │
└─────────────────┘                  └─────────────────┘                     └─────────────────┘
         │                                      │                                      │
         │ Socket.io (Real-time)                │ Database Operations                  │ Database Operations
         │                                      │                                      │
         └──────────────────────────────────────┼──────────────────────────────────────┘
                                                │
                                                ▼
                                    ┌─────────────────┐
                                    │   PostgreSQL    │
                                    │   + Prisma ORM  │
                                    │                 │
                                    └─────────────────┘
```

### Technology Stack

> **📋 Detailed Information**: See [`docs/architecture/tech-stack.md`](./architecture/tech-stack.md) for complete technology decisions, versions, constraints, and rationale.

**Key Technologies:**
- **Frontend**: React 19 + Vite + TanStack Router + Tailwind CSS
- **Backend API**: Fastify + TypeBox + Redis pub/sub
- **Game Engine**: Custom TypeScript + Socket.io + Decimal.js
- **Database**: PostgreSQL + Prisma ORM
- **Monorepo**: pnpm workspaces

### Repository Structure

- **Type**: Monorepo with pnpm workspaces
- **Package Manager**: pnpm (required for workspace dependencies)
- **Development**: All services start with single `pnpm dev` command
- **Notable**: Clean separation between HTTP API and real-time game logic

## Source Tree and Module Organization

> **📋 Detailed Information**: See [`docs/architecture/source-tree.md`](./architecture/source-tree.md) for comprehensive code organization guide, file locations, and navigation patterns.

**High-Level Structure:**
- **`apps/`** - Main applications (client, api-server, game-server)
- **`packages/`** - Shared libraries (database-api, auth-service, shared-types)
- **`docs/`** - BMad documentation structure

### Key Modules and Their Purpose

#### Client Application (`apps/client/`)
- **Game Components**: `src/components/game/` - Poker table, action buttons, community cards
- **Socket Service**: `src/services/socket.ts` - Real-time communication with game server
- **Game Store**: `src/stores/gameStore.ts` - Zustand store for game state management
- **Game Context**: `src/contexts/GameContext.tsx` - React context for game data

#### API Server (`apps/api-server/`)
- **Game Routes**: `src/routes/games/` - RESTful game CRUD operations
- **User Routes**: `src/routes/users/` - User authentication and management
- **Redis Service**: `src/services/redis.ts` - Pub/sub messaging to game server
- **Auth Integration**: Uses `@texas-holdem/auth-service` for JWT handling

#### Game Server (`apps/game-server/`) - **CORE ARCHITECTURE**
- **Game Manager**: `src/core/game/game-manager.ts` - **Singleton managing all active games**
- **Game Class**: `src/core/game/game.ts` - **Individual game logic and state**
- **Round Management**: `src/core/round/round.ts` - **Poker round lifecycle**
- **Betting Logic**: `src/core/round/betting-round.ts` - **Betting round phases**
- **Player Registry**: `src/services/player-registry.ts` - **Entity relationship mapping between User→Player→RoundPlayer→BettingRoundPlayer**
- **Card Engine**: `src/models/deck.ts` & `src/models/card.ts` - **Card dealing, shuffling, and poker hand logic**
- **Socket Manager**: `src/services/socket-manager.ts` - **WebSocket event coordination**
- **Message Broker**: `src/services/message-broker.ts` - **Redis pub/sub handling**

## Real-Time Architecture (Detailed)

### WebSocket Communication Flow

The real-time architecture is the **heart of the poker experience**, enabling synchronized gameplay across all connected clients.

#### Socket.io Event Flow

```
Client Action → Socket.io Client → Game Server → Game Logic → Database → Socket.io Broadcast → All Clients
```

#### Key Real-Time Events

**Client to Server Events:**
- `GAME_ROOM_JOIN` - Player joins as spectator
- `GAME_JOIN` - Player joins game with buy-in
- `GAME_LEAVE` - Player leaves game
- `PLAYER_ACTION` - Poker actions (call, raise, fold, check)

**Server to Client Events:**
- `GAME_UPDATE` - Broadcast game state changes
- `PLAYER_JOINED` - New player joined notification
- `DEALER_ROTATED` - Dealer button moved
- `BETTING_ROUND_STARTED` - New betting phase
- `ROUND_FINISHED` - Round completion with results

#### Socket Manager Architecture

```typescript
// apps/game-server/src/services/socket-manager.ts
export class SocketManager {
  private gameRoomConnections: Map<number, { userId: number; socketId: string; isSpectator: boolean }[]>
  
  // Validates events with Zod schemas
  public initializeClientListeners<T extends BaseSocketEvent>(listeners: InferSocketEvent<T>)
  
  // Broadcasts to all players in a game room
  public emitGameEvent(gameId: number, event: unknown)
}
```

#### Game State Synchronization

The system maintains **real-time consistency** through:

1. **Centralized Game State**: Game server holds authoritative state
2. **Event-Driven Updates**: All state changes broadcast immediately
3. **Client State Reconciliation**: Client stores sync with server events
4. **Optimistic Updates**: Client shows immediate feedback, server confirms

### Inter-Service Communication

#### API Server ↔ Game Server Communication

**Redis Pub/Sub Pattern:**
```typescript
// API Server publishes events
await redis.publish('api-channel', JSON.stringify({
  event: 'GAME_CREATED',
  payload: createdGame,
  timestamp: Date.now(),
}));

// Game Server subscribes and handles
messageBroker.listenMessages(gameManager.messageBrokerEvents);
```

**Current Events:**
- `GAME_CREATED` - API server notifies game server of new game

## Game Logic Architecture (Detailed)

### Core Game Engine Design

The poker engine is built with **domain-driven design** principles, separating business logic from infrastructure concerns.

#### Game Manager (Singleton Pattern)

```typescript
// apps/game-server/src/core/game/game-manager.ts
export class GameManager {
  private games: Game[] = []; // In-memory storage for < 1000 games
  
  // Socket event handlers with Zod validation
  public readonly socketEvents = {
    GAME_ROOM_JOIN: { schema: schemas.gameRoomJoin, handler: this.handeGameRoomJoin },
    GAME_JOIN: { schema: schemas.gameJoin, handler: this.handleGameJoin },
    PLAYER_ACTION: { schema: schemas.playerAction, handler: this.handlePlayerAction },
  }
}
```

**Responsibilities:**
- Maintains all active games in memory
- Routes socket events to appropriate game instances
- Handles game lifecycle (creation, joining, leaving)
- Validates all incoming events with Zod schemas

#### Individual Game Logic

```typescript
// apps/game-server/src/core/game/game.ts
export class Game {
  public players: Player[]
  public tablePositions: TablePosition[]
  public blinds: Blind<Decimal>[]
  public activeRound?: Round
  
  // Core game methods
  public async initiateNewRound()
  public async handlePlayerAction(actions: PlayerActionTuple)
  public isReadyToStart(): boolean
  public isFull(): boolean
}
```

**Key Features:**
- **Precise Calculations**: Uses Decimal.js for all monetary operations
- **Immutable Updates**: Immer for safe state modifications
- **Transaction Safety**: Database operations wrapped in transactions
- **Real-time Broadcasting**: Immediate state synchronization

#### Round and Betting Logic

**Round Lifecycle:**
1. **Pre-flop**: Deal hole cards, collect blinds
2. **Flop**: Deal 3 community cards, betting round
3. **Turn**: Deal 1 community card, betting round  
4. **River**: Deal final community card, betting round
5. **Showdown**: Determine winner, distribute pot

```typescript
// apps/game-server/src/core/round/round.ts
export class Round {
  public pot: Decimal
  public communityCards: Card[]
  public players: RoundPlayer[]
  public bettingRounds: BettingRound[]
  
  static async create(game: Game) {
    // Dealer rotation logic
    // Card dealing with shuffled deck
    // Blind collection
    // Database persistence
  }
}
```

#### Betting Round Management

```typescript
// apps/game-server/src/core/round/betting-round.ts
export class BettingRound {
  public async handlePlayerAction(
    playerId: number, 
    actions: PlayerActionTuple,
    bigBlindAmount: Decimal
  )
  
  public async rotateActivePlayer(): Promise<number>
  public isFinished(): boolean
}
```

**Betting Features:**
- **Action Validation**: Ensures legal poker actions
- **Pot Management**: Accurate side pot calculations
- **Player Rotation**: Proper betting order maintenance
- **All-in Handling**: Complex all-in scenarios

### Data Model Architecture

#### Database Schema Design

The system uses **Prisma ORM** with a **normalized relational model** optimized for poker gameplay:

**Core Entities:**
- `User` - Player accounts and authentication
- `Game` - Poker table configuration and settings
- `Player` - User's participation in specific game
- `Round` - Individual poker hand/round
- `BettingRound` - Phases within a round (preflop, flop, etc.)
- `BettingRoundAction` - Individual player actions
- `TablePosition` - Seating and dealer button management

**Key Design Decisions:**
- **Decimal precision** for all monetary values
- **Normalized structure** to prevent data inconsistency
- **Audit trail** with created/updated timestamps
- **Flexible blinds** supporting various game formats

#### Repository Pattern Implementation

```typescript
// packages/database-api/src/repositories/
- game.repository.ts      // Game CRUD operations
- player.repository.ts    // Player management
- round.repository.ts     // Round lifecycle
- betting-round.repository.ts // Betting operations
```

**Benefits:**
- **Separation of concerns** between business logic and data access
- **Type safety** with Prisma-generated types
- **Transaction support** for complex operations
- **Consistent error handling** across all data operations

## Technical Debt and Known Issues

### Current Technical Debt

1. **Database Migrations**: 32 migrations with generic names like "test" - indicates rapid development phase
   - **Location**: `packages/database-api/prisma/migrations/`
   - **Impact**: Migration history is unclear, rollback complexity
   - **Recommendation**: Consolidate migrations before production

2. **Game Server Memory Storage**: Games stored in memory array
   - **Location**: `apps/game-server/src/core/game/game-manager.ts:53`
   - **Current**: Array iteration for game lookup - could be optimized to Map/Object for O(1) access
   - **Planned Enhancement**: Server restart recovery for ongoing games (see TODO at line 104)
   - **Future Consideration**: Redis-based game state caching for performance (optional)

3. **Error Handling Inconsistency**: Mixed error handling patterns
   - **API Server**: Structured error mapping with HTTP status codes
   - **Game Server**: Basic console.error logging
   - **Recommendation**: Standardize error handling across services

4. **Testing Coverage**: Limited test infrastructure
   - **Game Server**: Jest configuration exists but minimal tests
   - **Client/API Server**: No visible test setup
   - **Risk**: Regression potential during enhancements

### Workarounds and Gotchas

- **Development Ports**: Fixed ports (3000, 3002, 4000) - ensure no conflicts
- **Redis Dependency**: All services require Redis for pub/sub messaging
- **Database Cleanup**: Game server clears rounds on startup (`db.game.clearRounds()`) - **Development only** for easy round restart during hot reloading
- **Socket.io CORS**: Currently allows all origins (`cors: { origin: '*' }`)

## Integration Points and External Dependencies

### Internal Service Communication

| From Service | To Service   | Method      | Purpose                    | Key Files                           |
|--------------|--------------|-------------|----------------------------|-------------------------------------|
| Client       | API Server   | HTTP/REST   | User auth, game CRUD       | `apps/client/src/hooks/useGames.ts` |
| Client       | Game Server  | Socket.io   | Real-time gameplay         | `apps/client/src/services/socket.ts` |
| API Server   | Game Server  | Redis       | Game creation events       | `apps/api-server/src/services/redis.ts` |
| All Services | Database     | Prisma      | Data persistence           | `packages/database-api/` |

### External Dependencies

| Service       | Purpose               | Configuration                    | Notes                    |
|---------------|-----------------------|----------------------------------|--------------------------|
| PostgreSQL    | Primary database      | `DATABASE_URL` env variable      | Required for all data    |
| Redis         | Pub/sub messaging     | `REDIS_URL` env variable         | Inter-service events     |

### Shared Package Dependencies

```typescript
// All services depend on:
- @texas-holdem/shared-types    // Common TypeScript interfaces
- @texas-holdem/database-api    // Prisma repositories
- @texas-holdem/auth-service    // JWT authentication (API server only)
```

## Development and Deployment

> **📋 Development Standards**: See [`docs/architecture/coding-standards.md`](./architecture/coding-standards.md) for development patterns, conventions, validation approaches, and code quality standards.

### Local Development Setup

**Prerequisites:**
- Node.js 18+, pnpm 10.4.0, PostgreSQL, Redis

**Quick Start:**
```bash
pnpm install && pnpm dev  # Start all services (ports 3000, 3002, 4000)
```

### Build and Deployment Process

**Current State:**
- **Personal project** in active development
- Development-focused setup with hot reloading
- **Not production-ready** - intended for testing and learning
- **Future consideration**: May be hosted for public testing without real money deposits
- No production build scripts or deployment pipeline yet

**Testing Infrastructure:**
```bash
pnpm test:game-server  # Jest tests for game logic
```

## Extension Points for Future Enhancements

Based on the concept.md vision, the architecture supports these planned enhancements:

### Tournament Mode Integration

**Extension Points:**
- `Game` model can be extended with tournament-specific fields
- `GameManager` can handle tournament bracket logic
- Real-time events can broadcast tournament updates
- New database entities: `Tournament`, `TournamentPlayer`, `TournamentRound`

### Real Money Integration

**Extension Points:**
- `Account` model already exists with balance tracking
- Decimal.js ensures monetary precision
- Transaction support in repositories
- Payment service integration through API server

### Additional Poker Variants

**Extension Points:**
- `Game` configuration supports different blind structures
- Card logic is modular and extensible
- Betting logic can be customized per variant
- UI components are game-agnostic

### Admin UI Development

**Extension Points:**
- API server routes can be extended with admin endpoints
- Authentication service supports role-based access (`UserRole.ADMIN`)
- Game server provides read-only game state access
- Real-time monitoring through Socket.io events

## Appendix

> **📋 Development Commands**: See [`docs/architecture/tech-stack.md`](./architecture/tech-stack.md) for complete development environment setup and commands.

### Debugging and Troubleshooting

**Common Issues:**
- **Port conflicts**: Ensure ports 3000, 3002, 4000 are available
- **Redis connection**: Verify Redis server is running and accessible
- **Database connection**: Check PostgreSQL connection and credentials
- **Prisma client**: Regenerate if schema changes aren't reflected

**Useful Debugging:**
- Game server logs all Socket.io events to console
- API server uses Pino logger with pretty formatting
- Browser dev tools for client-side Socket.io debugging

---

## Conclusion

This brownfield architecture document captures the **current reality** of a sophisticated real-time poker platform. The system demonstrates **solid architectural principles** with clear separation of concerns, type safety, and real-time capabilities.

**Strengths:**
- Clean monorepo structure with shared packages
- Robust real-time architecture with Socket.io
- Type-safe development with TypeScript and Prisma
- Precise monetary calculations with Decimal.js
- Scalable game engine design

**Areas for Enhancement:**
- Production deployment preparation
- Comprehensive testing strategy
- Performance optimization for scale
- Security hardening for real money

The architecture provides **excellent foundation** for the planned enhancements (tournaments, real money, additional variants) while maintaining code quality and developer experience.
