# Technology Stack - Texas Hold'em Poker Platform

## Overview

This document captures the technology decisions, constraints, and rationale for the Texas Hold'em poker platform. This serves as a reference for AI development agents working on the system.

## Technology Stack (Production Versions)

| Category           | Technology        | Version | Rationale & Constraints                          |
|--------------------|-------------------|---------|--------------------------------------------------|
| **Runtime**        | Node.js           | 18+     | Required for all services, LTS stability        |
| **Package Manager**| pnpm              | 10.4.0  | Workspace management, faster than npm           |
| **Frontend**       | React             | 19.0.0  | Latest React with concurrent features            |
| **Build Tool**     | Vite              | 6.1.0   | Fast HMR and optimized builds                   |
| **Routing**        | TanStack Router   | 1.106.0 | Type-safe routing with code splitting           |
| **State Management**| TanStack Query   | 5.66.7  | Server state + TanStack Store → Zustand migration planned |
| **Styling**        | Tailwind CSS      | 4.0.7   | Utility-first styling                           |
| **Backend API**    | Fastify           | 5.2.1   | High-performance HTTP server                     |
| **Validation**     | TypeBox           | 0.34.25 | Runtime schema validation for APIs               |
| **Game Engine**    | Custom TypeScript | N/A     | Real-time poker logic                            |
| **Real-time**      | Socket.io         | 4.8.1   | Bidirectional WebSocket communication           |
| **Database**       | PostgreSQL        | Latest  | Primary data store, ACID compliance             |
| **ORM**            | Prisma            | 6.4.0   | Type-safe database access + migrations          |
| **Cache/PubSub**   | Redis (ioredis)   | 5.5.0   | Inter-service messaging                          |
| **Calculations**   | Decimal.js        | 10.5.0  | Precise monetary calculations (critical for poker) |
| **State Mgmt**     | Immer             | 10.1.1  | Immutable state updates                          |
| **Scheduling**     | Toad Scheduler    | 3.0.1   | Game timer management                            |

## Technology Constraints & Decisions

### Critical Design Decisions

1. **Decimal.js for Monetary Operations**
   - **Why**: JavaScript's floating-point arithmetic is unsuitable for money
   - **Constraint**: ALL monetary calculations must use Decimal.js
   - **Impact**: Ensures precise poker pot calculations

2. **Socket.io for Real-time Communication**
   - **Why**: Bidirectional events, automatic fallback, room management
   - **Constraint**: All real-time game events must go through Socket.io
   - **Impact**: Enables synchronized multiplayer gameplay

3. **Prisma ORM**
   - **Why**: Type safety, migration management, excellent TypeScript integration
   - **Constraint**: All database operations must use Prisma repositories
   - **Impact**: Prevents SQL injection, ensures type safety

4. **pnpm Workspaces**
   - **Why**: Efficient monorepo dependency management
   - **Constraint**: Must use pnpm (not npm/yarn) for workspace compatibility
   - **Impact**: Shared packages work correctly across services

### Architecture Constraints

1. **Microservices Separation**
   - API Server: HTTP/REST operations only
   - Game Server: Real-time poker logic only
   - Client: UI and user interaction only

2. **Database Design**
   - Normalized relational model
   - All monetary values as Decimal precision
   - Audit trails with timestamps

3. **Real-time Requirements**
   - Sub-second response times for player actions
   - Synchronized state across all connected clients
   - Graceful handling of network disconnections

## Development Environment Requirements

### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm 10.4.0 (required for workspaces)
- PostgreSQL instance (local or remote)
- Redis instance (local or remote)

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Authentication
JWT_SECRET="your-secret-key"
```

### Port Allocation
- **Client**: 4000 (Vite dev server)
- **API Server**: 3000 (Fastify HTTP)
- **Game Server**: 3002 (Socket.io)

## External Dependencies

### Required Services
- **PostgreSQL**: Primary data persistence
- **Redis**: Inter-service messaging and caching

### Optional Services (Future)
- **Payment Gateway**: For real money integration
- **Monitoring**: Application performance monitoring
- **CDN**: Static asset delivery

## Migration Considerations

### Planned Technology Changes
1. **State Management Migration**: TanStack Store → Zustand
   - **Reason**: Simpler API, better performance
   - **Timeline**: Epic 1, Story 1.2
   - **Impact**: Client-side state management refactor

2. **Testing Framework Addition**
   - **Current**: Minimal Jest setup
   - **Planned**: Comprehensive testing strategy
   - **Timeline**: Epic 1, Story 1.1

### Technology Debt
1. **32 Generic Database Migrations**: Need consolidation before production
2. **Mixed Error Handling**: Standardization needed across services
3. **Limited Test Coverage**: Comprehensive testing infrastructure needed

---

*This document should be updated when making technology decisions or adding new dependencies.*
