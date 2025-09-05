# Story 1.8: Table UI Positioning

**Epic**: Epic 1: Cash Game Foundation Stabilization  

## Status
Draft

## Story
**As a** Player,
**I want** to always see myself positioned at the bottom of the poker table,
**so that** I have an optimal gameplay perspective following standard poker UI conventions.

## Acceptance Criteria
1. Implement dynamic table rotation so current player always appears at bottom position
2. Arrange other players clockwise from the current player's perspective
3. Maintain proper spatial relationships for betting order and game flow
4. Update all table-related UI elements to work with rotated positioning
5. Ensure dealer button and betting indicators rotate correctly with table view
6. Test positioning with different numbers of players (2-8 players)

## Tasks / Subtasks
- [ ] Analyze Current Table Layout (AC: 1, 3)
  - [ ] Review existing table positioning logic in game components
  - [ ] Document current static positioning implementation
  - [ ] Identify all UI elements affected by table rotation
- [ ] Implement Table Rotation Logic (AC: 1, 2)
  - [ ] Create table position calculation utility function
  - [ ] Implement player position mapping based on current user
  - [ ] Add rotation logic to arrange players clockwise from user position
  - [ ] Test rotation calculations with various player counts
- [ ] Update Table UI Components (AC: 4, 5)
  - [ ] Modify player seat rendering to use calculated positions
  - [ ] Update dealer button positioning to work with rotation
  - [ ] Fix betting indicators and turn highlights for rotated view
  - [ ] Ensure card dealing animations work with new positioning
- [ ] Test Multi-Player Scenarios (AC: 6)
  - [ ] Test 2-player games (heads-up positioning)
  - [ ] Test 3-6 player games (common table sizes)
  - [ ] Test full 8-player tables
  - [ ] Verify positioning works when players join/leave mid-game

## Dev Notes

### Previous Story Insights
From Story 1.1 findings: Table positions are currently static in the UI (position 1 always at top). Players expect to see themselves at the bottom following standard poker UI conventions, but currently appear wherever their assigned table position is located.

### Current Table Layout Issues
**Problem** [Source: Story 1.1 findings]:
- **File**: Table layout components in `apps/client/src/components/game/`
- **Issue**: Static positioning where position 1 always shows at top of table
- **Impact**: Poor UX, players may be positioned awkwardly on their own screen

### Technical Architecture Context

**Frontend Components** [Source: Project Structure Analysis]:
- **Game Components**: `apps/client/src/components/game/` - Table and player rendering
- **Game Layout**: `apps/client/src/components/layout/GameRoomLayout.tsx` - Overall game room structure
- **Game Store**: `apps/client/src/stores/gameStore.ts` - Client-side game state

### Current Working Elements
From existing codebase:
- ✅ **Player List Display**: Shows connected players correctly
- ✅ **Basic Table Rendering**: Table structure displays properly
- ❌ **Player Positioning**: Static positions don't rotate based on current user

### UI/UX Specifications
**Standard Poker Table Conventions**:
- Current player ("hero") always at bottom center
- Other players arranged clockwise from hero's perspective
- Dealer button rotates around table maintaining relative positions
- Betting order flows clockwise from hero's view

**Visual Requirements**:
- Maintain existing table aesthetics and styling
- Preserve card dealing animations with new positioning
- Keep betting indicators and turn highlights functional
- Ensure responsive design works with rotated layouts

### File Locations
**Components to Modify** [Source: Project Structure Analysis]:
- `apps/client/src/components/game/` - All table-related components
- `apps/client/src/components/layout/GameRoomLayout.tsx` - Main game layout
- Potentially `apps/client/src/stores/gameStore.ts` - If position state needs updating

### Technical Implementation Approach
**Position Calculation Strategy**:
1. Identify current user's table position
2. Calculate rotation offset to place user at bottom (position 0 in UI)
3. Map all other players' positions relative to rotated view
4. Update all UI elements to use calculated positions instead of absolute positions

**Example Rotation Logic**:
```
If user is in table position 3 (of 6 players):
- User (pos 3) → UI position 0 (bottom)  
- Player at pos 4 → UI position 1 (bottom-right)
- Player at pos 5 → UI position 2 (top-right)
- Player at pos 0 → UI position 3 (top)
- Player at pos 1 → UI position 4 (top-left) 
- Player at pos 2 → UI position 5 (bottom-left)
```

### Technical Constraints
- **Performance**: Position calculations should not impact rendering performance
- **Responsiveness**: Rotated layout must work on different screen sizes
- **Consistency**: All players should see consistent dealer button and betting flow
- **Animations**: Existing card and betting animations must work with new positioning

### Testing Requirements
**Unit Tests**:
- Position calculation utility functions
- Player mapping logic for various table sizes
- Edge cases (single player, empty positions)

**Visual Tests**:
- Screenshot testing for different player configurations
- Animation testing with rotated positions
- Responsive design testing

**User Experience Tests**:
- Verify intuitive betting order display
- Test dealer button positioning
- Confirm spatial relationships make sense

### Integration with Other Stories
**Dependencies**:
- Should work with corrected betting logic from Story 1.7
- Must integrate with any state management changes from Stories 1.2-1.3
- Should support authenticated users from Story 1.6

**Priority**: Medium - This is a UX improvement that can be implemented after critical game logic issues are resolved.

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| [Current Date] | 1.0 | Initial story creation based on Story 1.1 UX findings | Scrum Master |
