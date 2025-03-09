// Define the possible entity types in the chain
type EntityType = 'bettingRoundPlayer' | 'roundPlayer' | 'player' | 'user';

type GetEntityIdParams = {
  fromId: number;
  from: EntityType;
  to: EntityType;
};

export class PlayerRegistry {
  // Maps to store relationships
  private bettingRoundPlayerToRound = new Map<number, number>();

  private roundPlayerToPlayer = new Map<number, number>();

  private playerToUser = new Map<number, number>();

  // Register relationships
  registerBettingRoundPlayer(bettingRoundPlayerId: number, roundPlayerId: number) {
    this.bettingRoundPlayerToRound.set(bettingRoundPlayerId, roundPlayerId);
  }

  registerRoundPlayer(roundPlayerId: number, playerId: number) {
    this.roundPlayerToPlayer.set(roundPlayerId, playerId);
  }

  registerPlayer(playerId: number, userId: number) {
    this.playerToUser.set(playerId, userId);
  }

  // Generic lookup function
  getEntityId(params: GetEntityIdParams): number {
    // Define the chain of relationships
    const chain: [Map<number, number>, string][] = [
      [this.bettingRoundPlayerToRound, 'Round player'],
      [this.roundPlayerToPlayer, 'Player'],
      [this.playerToUser, 'User'],
    ];

    // Define indices for each entity type
    const entityIndices: Record<EntityType, number> = {
      bettingRoundPlayer: 0,
      roundPlayer: 1,
      player: 2,
      user: 3,
    };

    const fromIndex = entityIndices[params.from];
    const toIndex = entityIndices[params.to];

    if (fromIndex === toIndex) return params.fromId;
    if (fromIndex > toIndex) throw new Error('Cannot traverse chain backwards');

    let currentId = params.fromId;

    // Traverse through the chain from the starting point to the target
    for (let i = fromIndex; i < toIndex; i += 1) {
      const [map, entityName] = chain[i];
      const nextId = map.get(currentId);
      if (!nextId) throw new Error(`${entityName} not found`);
      currentId = nextId;
    }

    return currentId;
  }

  // Clean up methods
  clearBettingRound(bettingRoundPlayerId: number) {
    this.bettingRoundPlayerToRound.delete(bettingRoundPlayerId);
  }

  clearRound(roundPlayerId: number) {
    this.roundPlayerToPlayer.delete(roundPlayerId);
  }

  clearPlayer(playerId: number) {
    this.playerToUser.delete(playerId);
  }
}

export const playerRegistry = new PlayerRegistry();
