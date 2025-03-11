// Use string literal union instead of enum
type EntityType = 'bettingRoundPlayer' | 'roundPlayer' | 'player' | 'user';

// Define the entity chain structure
type EntityRelationship = {
  from: EntityType;
  to: EntityType;
  forwardMap: Map<number, number>;
  reverseMap: Map<number, number>;
  label: string;
};

// We can also create a type-safe way to reference entity types
const EntityTypes = {
  BettingRoundPlayer: 'bettingRoundPlayer',
  RoundPlayer: 'roundPlayer',
  Player: 'player',
  User: 'user',
} as const satisfies Record<string, EntityType>;

class EntityNotFoundError extends Error {
  constructor(entityType: string, id: number) {
    super(`${entityType} with ID ${id} not found`);
    this.name = 'EntityNotFoundError';
  }
}

type GetEntityIdParams = {
  fromId: number;
  from: EntityType;
  to: EntityType;
};

export class PlayerRegistry {
  // Maps
  private bettingRoundPlayerToRound = new Map<number, number>();

  private roundPlayerToPlayer = new Map<number, number>();

  private playerToUser = new Map<number, number>();

  private roundToBettingRoundPlayer = new Map<number, number>();

  private playerToRoundPlayer = new Map<number, number>();

  private userToPlayer = new Map<number, number>();

  // Single source of truth for entity relationships
  private readonly entityRelationships: EntityRelationship[] = [
    {
      from: EntityTypes.BettingRoundPlayer,
      to: EntityTypes.RoundPlayer,
      forwardMap: this.bettingRoundPlayerToRound,
      reverseMap: this.roundToBettingRoundPlayer,
      label: 'Round player',
    },
    {
      from: EntityTypes.RoundPlayer,
      to: EntityTypes.Player,
      forwardMap: this.roundPlayerToPlayer,
      reverseMap: this.playerToRoundPlayer,
      label: 'Player',
    },
    {
      from: EntityTypes.Player,
      to: EntityTypes.User,
      forwardMap: this.playerToUser,
      reverseMap: this.userToPlayer,
      label: 'User',
    },
  ];

  private getEntityIndexes(from: EntityType, to: EntityType) {
    // First try forward direction
    let fromIndex = -1;
    let toIndex = -1;

    // Try to find a forward path
    for (let i = 0; i < this.entityRelationships.length; i += 1) {
      const currentRelationship = this.entityRelationships[i];

      if (currentRelationship.from === from) fromIndex = i;
      if (currentRelationship.to === to) toIndex = i;
    }

    // Valid forward path found
    if (fromIndex !== -1 && toIndex !== -1 && fromIndex <= toIndex) {
      return { fromIndex, toIndex, direction: 'forward' };
    }

    // Try reverse direction if forward failed
    fromIndex = -1;
    toIndex = -1;
    for (let i = 0; i < this.entityRelationships.length; i += 1) {
      const currentRelationship = this.entityRelationships[i];
      if (currentRelationship.from === to) toIndex = i;
      if (currentRelationship.to === from) fromIndex = i;
    }

    // Valid reverse path found
    if (fromIndex !== -1 && toIndex !== -1 && toIndex <= fromIndex) {
      return { fromIndex, toIndex, direction: 'reverse' };
    }

    throw new Error('Invalid entity types');
  }

  registerBettingRoundPlayer(bettingRoundPlayerId: number, roundPlayerId: number): void {
    const relationship = this.entityRelationships[0];
    relationship.forwardMap.set(bettingRoundPlayerId, roundPlayerId);
    relationship.reverseMap.set(roundPlayerId, bettingRoundPlayerId);
  }

  registerRoundPlayer(roundPlayerId: number, playerId: number): void {
    const relationship = this.entityRelationships[1];
    relationship.forwardMap.set(roundPlayerId, playerId);
    relationship.reverseMap.set(playerId, roundPlayerId);
  }

  registerPlayer(playerId: number, userId: number): void {
    const relationship = this.entityRelationships[2];
    relationship.forwardMap.set(playerId, userId);
    relationship.reverseMap.set(userId, playerId);
  }

  getEntityId(params: GetEntityIdParams): number {
    const { fromIndex, toIndex, direction } = this.getEntityIndexes(params.from, params.to);
    const isForward = direction === 'forward';

    let currentId = params.fromId;

    const relationships = isForward
      ? this.entityRelationships.slice(fromIndex, toIndex + 1)
      : this.entityRelationships.slice(toIndex, fromIndex + 1).reverse();

    for (let i = 0; i < relationships.length; i += 1) {
      const relationship = relationships[i];
      const map = isForward ? relationship.forwardMap : relationship.reverseMap;
      const nextId = map.get(currentId);
      if (!nextId) {
        throw new EntityNotFoundError(relationship.label, currentId);
      }
      currentId = nextId;
    }

    return currentId;
  }

  private clearRelationship(relationship: EntityRelationship, id: number): void { // eslint-disable-line class-methods-use-this
    const targetId = relationship.forwardMap.get(id);
    if (targetId) {
      relationship.reverseMap.delete(targetId);
    }
    relationship.forwardMap.delete(id);
  }

  clearBettingRound(bettingRoundPlayerId: number): void {
    this.clearRelationship(this.entityRelationships[0], bettingRoundPlayerId);
  }

  clearRound(roundPlayerId: number): void {
    this.clearRelationship(this.entityRelationships[1], roundPlayerId);
  }

  clearPlayer(playerId: number): void {
    this.clearRelationship(this.entityRelationships[2], playerId);
  }
}

export const playerRegistry = new PlayerRegistry();
