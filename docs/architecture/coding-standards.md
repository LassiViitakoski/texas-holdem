# Coding Standards - Texas Hold'em Poker Platform

## Overview

This document defines the development patterns, conventions, and standards for the Texas Hold'em poker platform. These standards ensure code consistency, maintainability, and quality across all services and packages.

## TypeScript Standards

### Type Safety Requirements
- **Strict Mode**: All TypeScript configs use strict mode
- **No Any Types**: Avoid `any` - use proper typing or `unknown`
- **Explicit Return Types**: Functions should have explicit return types
- **Interface over Type**: Prefer interfaces for object shapes

```typescript
// ✅ Good
interface GameState {
  id: number;
  status: GameStatus;
  players: Player[];
}

function createGame(config: GameConfig): Promise<Game> {
  // implementation
}

// ❌ Avoid
function createGame(config: any): any {
  // implementation
}
```

### Import/Export Patterns
- **Named exports preferred** over default exports
- **Barrel exports** for packages (`index.ts` re-exports)
- **Workspace imports** for shared packages

```typescript
// ✅ Package imports
import { GameStatus, Player } from '@texas-holdem/shared-types';
import { gameRepository } from '@texas-holdem/database-api';

// ✅ Named exports
export { GameManager } from './game-manager';
export { Game } from './game';

// ✅ Barrel export (index.ts)
export * from './game-manager';
export * from './game';
```

## Architecture Patterns

### Singleton Pattern (Game Server)
Critical services use singleton pattern with proper initialization:

```typescript
// ✅ Singleton implementation
export class GameManager {
  private static instance: GameManager;
  private games: Game[] = [];

  private constructor() {}

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }
}
```

### Repository Pattern (Database)
All database operations use repository pattern:

```typescript
// ✅ Repository pattern
export class GameRepository {
  async create(data: CreateGameData): Promise<Game> {
    return await prisma.game.create({ data });
  }

  async findById(id: number): Promise<Game | null> {
    return await prisma.game.findUnique({ where: { id } });
  }
}
```

### Event-Driven Architecture (Real-time)
Socket events use structured event handling:

```typescript
// ✅ Event handler pattern
export const socketEvents = {
  GAME_JOIN: {
    schema: schemas.gameJoin,
    handler: handleGameJoin
  },
  PLAYER_ACTION: {
    schema: schemas.playerAction,
    handler: handlePlayerAction
  }
};
```

## Code Organization Standards

### File Structure
- **One class per file** (except small related types)
- **Descriptive file names** matching primary export
- **Consistent directory structure** across services

### Class Design
- **Single Responsibility Principle**: Each class has one clear purpose
- **Immutable State Updates**: Use Immer for state modifications
- **Error Handling**: Proper error types and handling

```typescript
// ✅ Immutable updates with Immer
import { produce } from 'immer';

export class Game {
  updatePlayerStack(playerId: number, newStack: Decimal): Game {
    return produce(this, draft => {
      const player = draft.players.find(p => p.id === playerId);
      if (player) {
        player.stack = newStack;
      }
    });
  }
}
```

## Validation Standards

### Schema Validation
- **TypeBox for API routes** (Fastify integration)
- **Zod for Socket.io events** (runtime validation)
- **Prisma for database** (compile-time types)

```typescript
// ✅ TypeBox API validation
export const CreateGameSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100 }),
  maxPlayers: Type.Number({ minimum: 2, maximum: 10 }),
  blinds: Type.Array(Type.Object({
    smallBlind: Type.Number({ minimum: 0.01 }),
    bigBlind: Type.Number({ minimum: 0.02 })
  }))
});

// ✅ Zod Socket validation
export const gameJoinSchema = z.object({
  gameId: z.number().positive(),
  buyInAmount: z.number().positive()
});
```

## Error Handling Standards

### Error Types
- **Domain-specific errors** with proper inheritance
- **Structured error responses** with consistent format
- **Proper error logging** with context

```typescript
// ✅ Custom error types
export class GameFullError extends Error {
  constructor(gameId: number) {
    super(`Game ${gameId} is full`);
    this.name = 'GameFullError';
  }
}

// ✅ Error handling in services
try {
  await game.addPlayer(player);
} catch (error) {
  if (error instanceof GameFullError) {
    return { success: false, error: 'Game is full' };
  }
  throw error; // Re-throw unexpected errors
}
```

## Monetary Calculations

### Decimal.js Requirements
**CRITICAL**: All monetary operations must use Decimal.js:

```typescript
// ✅ Monetary calculations
import { Decimal } from 'decimal.js';

export class BettingRound {
  private pot: Decimal = new Decimal(0);

  addToPot(amount: Decimal): void {
    this.pot = this.pot.plus(amount);
  }

  calculateSidePots(players: Player[]): Decimal[] {
    // Use Decimal arithmetic throughout
    return players.map(p => new Decimal(p.contribution));
  }
}

// ❌ Never use JavaScript numbers for money
const pot = 10.50 + 5.25; // Floating point errors!
```

## Real-time Standards

### Socket.io Event Naming
- **SCREAMING_SNAKE_CASE** for event names
- **Descriptive event names** indicating direction and purpose
- **Structured event payloads** with validation

```typescript
// ✅ Event naming and structure
export const SOCKET_EVENTS = {
  // Client to Server
  GAME_ROOM_JOIN: 'GAME_ROOM_JOIN',
  PLAYER_ACTION: 'PLAYER_ACTION',
  
  // Server to Client
  GAME_UPDATE: 'GAME_UPDATE',
  PLAYER_JOINED: 'PLAYER_JOINED'
} as const;

// ✅ Event payload structure
interface PlayerActionEvent {
  gameId: number;
  playerId: number;
  action: {
    type: 'CALL' | 'RAISE' | 'FOLD' | 'CHECK';
    amount?: number;
  };
}
```

### State Synchronization
- **Server is authoritative** for all game state
- **Client optimistic updates** with server confirmation
- **Event-driven state changes** broadcast to all clients

## Testing Standards

### Test Organization
- **Unit tests** for business logic (game rules, calculations)
- **Integration tests** for database operations
- **End-to-end tests** for complete user flows

```typescript
// ✅ Test structure
describe('BettingRound', () => {
  describe('handlePlayerAction', () => {
    it('should handle valid call action', async () => {
      // Arrange
      const bettingRound = new BettingRound(/* ... */);
      
      // Act
      const result = await bettingRound.handlePlayerAction(
        playerId, 
        { type: 'CALL' },
        bigBlindAmount
      );
      
      // Assert
      expect(result.success).toBe(true);
    });
  });
});
```

## Performance Standards

### Database Operations
- **Use transactions** for multi-step operations
- **Batch operations** when possible
- **Proper indexing** on frequently queried fields

```typescript
// ✅ Transaction usage
async createRound(gameId: number): Promise<Round> {
  return await prisma.$transaction(async (tx) => {
    const round = await tx.round.create({ data: { gameId } });
    await tx.bettingRound.create({ data: { roundId: round.id } });
    return round;
  });
}
```

### Memory Management
- **Cleanup event listeners** when components unmount
- **Avoid memory leaks** in singleton services
- **Efficient data structures** for game state

## Security Standards

### Input Validation
- **Validate all inputs** at service boundaries
- **Sanitize user data** before database operations
- **Rate limiting** on critical endpoints

### Authentication
- **JWT tokens** for stateless authentication
- **Middleware validation** on protected routes
- **Socket.io authentication** for real-time events

```typescript
// ✅ Authentication middleware
export const authenticateSocket = (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};
```

## Documentation Standards

### Code Comments
- **JSDoc for public APIs** and complex functions
- **Inline comments** for business logic explanations
- **TODO comments** with context and timeline

```typescript
/**
 * Handles a player action in the current betting round
 * @param playerId - The ID of the player making the action
 * @param action - The poker action (call, raise, fold, check)
 * @param bigBlindAmount - Current big blind amount for validation
 * @returns Promise resolving to action result
 */
async handlePlayerAction(
  playerId: number, 
  action: PlayerActionTuple,
  bigBlindAmount: Decimal
): Promise<ActionResult> {
  // TODO: Implement side pot calculation for all-in scenarios
  // Expected completion: Epic 1, Story 1.4
}
```

### Commit Messages
- **Conventional commits** format
- **Clear, descriptive messages**
- **Reference issues/stories** when applicable

```bash
# ✅ Good commit messages
feat(game-server): implement side pot calculation for all-in scenarios
fix(client): resolve state sync issue on player disconnect
docs(architecture): update real-time event documentation

# ❌ Avoid
fix bug
update code
wip
```

---

*These standards should be enforced through ESLint configuration and code review processes.*
