# Story 1.7: Betting Logic Overhaul

**Epic**: Epic 1: Cash Game Foundation Stabilization

## Status
Draft

## Story
**As a** Game Developer,
**I want** to completely overhaul the betting logic system,
**so that** all poker actions (fold, call, raise, check) work correctly and games can progress through complete rounds without crashes or rule violations.

## Acceptance Criteria
1. Fix server-side action validation to properly handle single and multiple action sequences
2. Correct client-side betting logic to send appropriate actions based on game state
3. Implement proper fold handling that ends rounds when only one player remains
4. Enable raise actions to work correctly in all betting scenarios (preflop, flop, turn, river)
5. Add proper betting round completion logic and automatic round progression
6. Implement player timeout handling with automatic fold functionality
7. Ensure all betting actions properly update game state and notify all clients

## Tasks / Subtasks
- [ ] Fix Server Action Validation (AC: 1)
  - [ ] Update Zod schema in `apps/game-server/src/core/game/game-manager.ts` to handle multiple actions
  - [ ] Modify action validation to accept both single actions and action sequences
  - [ ] Add proper validation for action amounts and constraints
  - [ ] Test all action types against new validation schema
- [ ] Correct Client Betting Logic (AC: 2, 4)
  - [ ] Analyze and fix client-side action calculation logic
  - [ ] Implement proper raise logic that sends single RAISE action instead of CALL+RAISE
  - [ ] Fix big blind raise logic to not include unnecessary CALL actions
  - [ ] Update betting UI to calculate correct action amounts
- [ ] Fix Fold and Round Completion (AC: 3, 5)
  - [ ] Update betting round logic in `apps/game-server/src/core/round/betting-round.ts`
  - [ ] Implement win-by-elimination detection when only one player remains
  - [ ] Add automatic pot distribution when round ends by folding
  - [ ] Fix round progression after showdown completion
  - [ ] Implement proper dealer button rotation between rounds
- [ ] Player Timeout Implementation (AC: 6)
  - [ ] Connect toad-scheduler timeout events to game logic
  - [ ] Implement automatic fold action for timed-out players
  - [ ] Add Socket.io events to notify clients of timeout actions
  - [ ] Test timeout handling across different game states
- [ ] State Synchronization (AC: 7)
  - [ ] Ensure all betting actions trigger proper Socket.io events
  - [ ] Update game state persistence for all action types
  - [ ] Test real-time synchronization across multiple clients
  - [ ] Add error handling for failed state updates

## Dev Notes

### Previous Story Insights
From Story 1.1 findings: Multiple critical issues identified in betting system:
- **Problem #2**: Server crashes on ALL raise actions due to Zod validation expecting single actions but receiving action arrays
- **Problem #4**: Fold actions don't end rounds when only one player remains, violating fundamental poker rules
- **Problem #3**: Timeout system exists but doesn't execute automatic actions
- **Problem #6**: Rounds don't restart after completion, games end after single hand

### Current Betting System Issues

**Server-Side Problems** [Source: Story 1.1 findings]:
- **File**: `apps/game-server/src/core/game/game-manager.ts` lines 24-43
- **Issue**: Zod schema only accepts single-element tuples but client sends multiple actions
- **Error**: "Array must contain at most 1 element(s)" on actions field

**Client-Side Problems** [Source: Story 1.1 findings]:
- **Pattern**: Client consistently sends `[{ type: 'CALL', amount: 0 }, { type: 'RAISE', amount: X }]`
- **Issue**: Incorrect betting logic that doesn't understand when CALL is unnecessary
- **Impact**: All raise scenarios broken across all betting rounds

### Technical Architecture Context

**Game Server Components** [Source: Project Structure Analysis]:
- **Game Manager**: `apps/game-server/src/core/game/game-manager.ts` - Main action handling
- **Betting Round**: `apps/game-server/src/core/round/betting-round.ts` - Round logic
- **Action Processing**: `apps/game-server/src/core/round/betting-round-action.ts` - Action validation
- **Scheduler**: Uses toad-scheduler for timeout management

**Client Components** [Source: Project Structure Analysis]:
- **Game Components**: `apps/client/src/components/game/` - Betting UI components
- **Game Store**: `apps/client/src/stores/gameStore.ts` - Client-side state management
- **Socket Service**: `apps/client/src/services/gameSocket.ts` - Server communication

### Current Working Actions
From Story 1.1 testing:
- ✅ **CALL**: Works in preflop scenarios
- ✅ **CHECK**: Works correctly when no bet present
- ❌ **RAISE**: Completely broken in all scenarios
- ❌ **FOLD**: Doesn't end rounds properly

### API Specifications
**Socket.io Events to Fix**:
- `PLAYER_ACTION` - Must handle corrected action formats
- Add timeout-related events for automatic actions
- Ensure proper game state broadcast after all actions

**Database Updates Needed**:
- Verify betting actions are properly persisted
- Ensure round state transitions are recorded correctly

### File Locations
**Critical Files to Modify**:
- `apps/game-server/src/core/game/game-manager.ts` - Action validation schema
- `apps/game-server/src/core/round/betting-round.ts` - Round completion logic  
- `apps/game-server/src/core/round/betting-round-action.ts` - Action processing
- Client betting components in `apps/client/src/components/game/`
- Game socket service in `apps/client/src/services/gameSocket.ts`

### Technical Constraints
- **Backward Compatibility**: Existing working actions (CALL, CHECK) must continue to function
- **Real-time Performance**: Betting actions must remain responsive (<100ms)
- **State Consistency**: All clients must receive identical game state updates
- **Error Handling**: Failed actions should not crash the game server

### Testing Requirements
**Unit Tests**:
- Action validation schema for all action types
- Betting round completion logic
- Timeout handling functionality
- Client action calculation logic

**Integration Tests**:
- Complete betting rounds from preflop through showdown
- Multi-player betting scenarios with various action combinations
- Timeout scenarios with automatic folding
- Round progression and dealer button rotation

**Manual Testing Priority**:
- All raise scenarios (preflop, flop, turn, river)
- Fold scenarios in 2+ player games
- Player timeout behavior
- Multi-round game progression

### Poker Rules Implementation
**Critical Rules to Implement Correctly**:
- Round ends immediately when only one active player remains
- Proper pot distribution to remaining player after folds
- Correct betting round progression (preflop → flop → turn → river → showdown)
- Automatic dealer button and blind rotation between rounds

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| [Current Date] | 1.0 | Initial story creation based on Story 1.1 critical findings | Scrum Master |
