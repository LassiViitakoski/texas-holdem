import { Decimal } from 'decimal.js';
import { db } from '@texas-holdem/database-api';
import type { CardNotation } from '@texas-holdem/shared-types';
import { produce } from 'immer';
import { BettingRound } from './betting-round';
import { Card, Deck } from '../../models';
import { BettingRoundAction } from './betting-round-action';
import { playerRegistry, socketManager } from '../../services';
import type { Game } from '../game';
import { RoundPlayer, BettingRoundPlayer } from '../player';

interface RoundProps {
  id: number;
  pot: Decimal;
  isFinished: boolean;
  players: RoundPlayer[];
  deck: Deck;
  activeBettingRound?: BettingRound;
  completedBettingRounds?: BettingRound[];
  communityCards?: Card[];
}

export class Round {
  public id: number;

  public pot: Decimal;

  public isFinished: boolean;

  public activeBettingRound: BettingRound | null;

  public completedBettingRounds: BettingRound[];

  public players: RoundPlayer[];

  public deck: Deck;

  public communityCards: Card[];

  constructor(params: RoundProps) {
    this.id = params.id;
    this.pot = params.pot;
    this.isFinished = params.isFinished;
    this.deck = params.deck;
    this.players = params.players;
    this.activeBettingRound = params.activeBettingRound || null;
    this.completedBettingRounds = params.completedBettingRounds || [];
    this.communityCards = params.communityCards || [];
  }

  public toJSON() {
    return {
      id: this.id,
      pot: this.pot.toNumber(),
      isFinished: this.isFinished,
      players: this.players,
      activeBettingRound: this.activeBettingRound,
      completedBettingRounds: this.completedBettingRounds,
      communityCards: this.communityCards,
    };
  }

  public async proceedToNextBettingRound(gameId: number) {
    const { activeBettingRound } = this;
    const bettingRoundPhases = ['PREFLOP', 'FLOP', 'TURN', 'RIVER'] as const;

    if (!activeBettingRound || activeBettingRound.type === 'RIVER') {
      throw new Error('No active betting round found on {Round.proceedToNextBettingRound()}');
    }

    const currentPhaseIndex = bettingRoundPhases.indexOf(activeBettingRound.type);
    const nextPhase = bettingRoundPhases[currentPhaseIndex + 1];

    const createdBettingRound = await db.service.executeTransaction(async () => {
      const newBettingRound = await BettingRound.create({
        type: nextPhase,
        isFinished: false,
        players: [],
        roundId: this.id,
      });

      const brPlayers = await BettingRoundPlayer.createMany(
        activeBettingRound.players
          .filter((brPlayer) => !brPlayer.hasFolded)
          .map((brPlayer) => ({
            bettingRoundId: newBettingRound.id,
            position: brPlayer.position,
            roundPlayerId: playerRegistry.getEntityId({
              fromId: brPlayer.id,
              from: 'bettingRoundPlayer',
              to: 'roundPlayer',
            }),
          })),
      );

      newBettingRound.addPlayers(brPlayers);
      newBettingRound.activeBettingRoundPlayerId = brPlayers[0].id;

      const newCommunityCardsCount = nextPhase === 'FLOP'
        ? 3
        : 1;

      const newCommunityCards = this.deck.draw(newCommunityCardsCount, true);

      const { communityCards } = await db.round.updateCommunityCards(this.id, newCommunityCards);

      this.communityCards = communityCards.map((card) => Card.fromString(card as CardNotation));
      this.completedBettingRounds.push(activeBettingRound);
      this.activeBettingRound = newBettingRound;
      return newBettingRound;
    });

    socketManager.emitGameEvent(gameId, {
      type: 'NEW_BETTING_ROUND_STARTED',
      payload: {
        round: {
          activeBettingRound: createdBettingRound,
          completedBettingRounds: this.completedBettingRounds,
          communityCards: this.communityCards,
        },
        timeToActSeconds: 15,
      },
    });
  }

  public informRoundStarted(gameId: number, playerStacks: Record<string, { userId: number, updatedStack: Decimal }>) {
    socketManager.emitGameEvent(gameId, {
      type: 'ROUND_STARTS_SOON',
      payload: {
        secondsRemaining: 2,
      },
    });

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const payload = {
          round: JSON.parse(JSON.stringify({ // Use JSON.parse(JSON.stringify()) to clone the object for now. If we don't do this, immer will freeze some properties of object
            ...this.toJSON(),
            players: this.players.map((p) => ({
              ...p.toJSON(),
              cards: p.cards.map(() => 'N/A'), // Initialize player cards as N/A
            })),
          })),
          timeToActSeconds: 15,
          update: {
            playerStacks: Object.values(playerStacks).map(({ userId, updatedStack }) => ({
              userId,
              updatedStack: updatedStack.toNumber(),
            })),
          },
        };

        this.players.forEach((rPlayer, rPlayerIndex) => {
          const userId = playerRegistry.getEntityId({
            fromId: rPlayer.id,
            from: 'roundPlayer',
            to: 'user',
          });

          if (!userId) {
            throw new Error('User not found on {handleJoinGame()}');
          }

          const payloadWithPlayerCards = produce(payload, (d) => {
            const draft = d; // Satisfy eslint (no-param-reassign)
            draft.round.players[rPlayerIndex].cards = rPlayer
              .cards
              .map((c) => c.toString()); // Update player cards for the player
          });

          socketManager.emitUserEvent( // TODO: Works for now only for participated players, not for spectators
            gameId,
            userId,
            {
              type: 'ROUND_STARTED',
              payload: payloadWithPlayerCards,
            },
          );
          resolve();
        });
      }, 2000);
    });
  }

  public async addToPot(amount: Decimal) {
    this.pot = (await db.round.updatePot(this.id, amount)).pot;
    return this.pot;
  }

  static async create(game: Game) { // TODO: Refactor to accept parameters instead of whole game instance
    const deck = new Deck().shuffle();
    const dealerIndex = game.tablePositions.findIndex((tablePosition) => tablePosition.isDealer);
    const dealer = game.tablePositions[dealerIndex];

    if (!dealer) {
      throw new Error('Dealer not found on {Round.create()}');
    }

    // Leaves dealer as last player to act
    const positionsOrderedForRound = [
      ...game.tablePositions.slice(dealerIndex + 1),
      ...game.tablePositions.slice(0, dealerIndex + 1),
    ]
      .filter((tablePosition) => tablePosition.isPositionActive());

    const isHeadsUpGame = game.blinds.length === 2 && positionsOrderedForRound.length === 2;

    const {
      firstBettingRound, roundPlayers, playerStacks, ...roundDetails
    } = await db.round.initiate({
      gameId: game.id,
      pot: game.blinds.reduce((acc, blind) => acc.plus(blind.amount), new Decimal(0)),
      players: positionsOrderedForRound.map(({ playerId }, index) => {
        const player = game.players.find((p) => p.id === playerId);

        if (!player) {
          throw new Error('Player ID not found on {Round.create()}');
        }

        return {
          id: player.id,
          position: index + 1,
          initialStack: player.stack,
          playerId: player.id,
          cards: deck.draw(2, true),
        };
      }),
      actions: game.blinds.map((blind) => ({
        type: 'BLIND',
        amount: blind.amount,
        sequence: blind.position,
      })),
    });

    const round = new Round({
      ...roundDetails,
      deck,
      completedBettingRounds: [],
      players: roundPlayers.map((roundPlayer) => new RoundPlayer({
        ...roundPlayer,
        cards: roundPlayer.cards.map((card) => Card.fromString(card as CardNotation)),
      })),
      communityCards: roundDetails.communityCards.map((card) => Card.fromString(card as CardNotation)),
    });

    const activeBrPlayerId = firstBettingRound.players.find((_, index) => !firstBettingRound.actions[index])?.id
      || (
        isHeadsUpGame
          ? firstBettingRound.players[1].id // Heads-up games have the dealer acting first in preflop
          : firstBettingRound.players[0].id
      );

    const bettingRound = new BettingRound({
      ...firstBettingRound,
      activeBettingRoundPlayerId: activeBrPlayerId,
      actions: firstBettingRound.actions.map((action) => new BettingRoundAction(action)),
      players: firstBettingRound.players.map((bettingRoundPlayer) => new BettingRoundPlayer({
        ...bettingRoundPlayer, hasActed: false, hasFolded: false,
      })),
    });

    round.activeBettingRound = bettingRound;

    return {
      round,
      playerStacks,
    };
  }
}
