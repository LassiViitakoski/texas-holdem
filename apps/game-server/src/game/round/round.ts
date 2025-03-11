import { Decimal } from 'decimal.js';
import { db } from '@texas-holdem/database-api';
import type { CardNotation } from '@texas-holdem/shared-types';
import { produce } from 'immer';
import { SimpleIntervalJob, Task } from 'toad-scheduler';
import { BettingRound } from './betting-round';
import { Card, Deck } from '../../models';
import { BettingRoundAction } from './betting-round-action';
import { playerRegistry, socketManager } from '../../services';
import type { Game } from '../game';
import { RoundPlayer, BettingRoundPlayer } from '../player';
import { scheduler } from '../../services/scheduler';

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

  private playerActionTimer?: SimpleIntervalJob;

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

  public informRoundStarted(gameId: number, playerStacks: Record<string, { userId: number, updatedStack: Decimal }>) {
    socketManager.emitGameEvent(gameId, {
      type: 'ROUND_STARTS_SOON',
      payload: {
        secondsRemaining: 2,
      },
    });

    setTimeout(() => {
      const payload = {
        round: {
          ...this.toJSON(),
          players: this.players.map((p) => ({
            ...p.toJSON(),
            cards: p.cards.map(() => 'N/A'),
          })), // Initialize player cards as N/A
        },
        timeToActSeconds: 10000,
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
      });

      this.startPlayerActionTimer(this.activeBettingRound!.activeBettingRoundPlayerId, 10);

      /*
      socketManager.emitGameEvent(gameId, {
        type: 'ROUND_STARTED',
        payload: {
          round: this.toJSON(),
          update: {
            playerStacks: Object.fromEntries(
              Object.entries(playerStacks).map(([key, value]) => [key, value.toNumber()]),
            ),
          },
        },
      });

      const eventPayloads = this.players.map((rPlayer) => {
        const userId = playerRegistry.getEntityId({
          fromId: rPlayer.id,
          from: 'roundPlayer',
          to: 'user',
        });

        if (!userId) {
          throw new Error('User not found on {handleJoinGame()}');
        }

        return {
          user: { id: userId },
          cards: rPlayer.cards.map(() => 'N/A'),
        };
      });

      this.players.forEach((rPlayer, index) => {
        const producedEventPayloads = produce(eventPayloads, (d) => {
          const draft = d; // Satisfy eslint (no-param-reassign)
          draft[index].cards = rPlayer.cards.map((card) => card.toString());
        });

        socketManager.emitUserEvent(
          gameId,
          producedEventPayloads[index].user.id,
          {
            type: 'ROUND_CARDS_DEALT',
            payload: {
              roundCards: producedEventPayloads,
              timeToActSeconds: 10,
            },
          },
        );
      });
      */
    }, 2000);
  }

  private startPlayerActionTimer(bettingRoundPlayerId: number, timeoutSeconds: number) {
    this.cancelPlayerActionTimer();

    const task = new Task(`action-timeout-task-${this.id}`, () => {
      // Your timeout business logic here
      this.handlePlayerActionTimeout(bettingRoundPlayerId);
    });

    // Create a one-time job that runs after timeoutSeconds
    this.playerActionTimer = new SimpleIntervalJob(
      { seconds: timeoutSeconds, runImmediately: false },
      task,
      {
        preventOverrun: true,
        id: `action-timeout-job-${this.id}`,
      },
    );

    scheduler.addSimpleIntervalJob(this.playerActionTimer);
  }

  private cancelPlayerActionTimer() {
    if (this.playerActionTimer) {
      if (this.playerActionTimer.id) {
        scheduler.removeById(this.playerActionTimer.id);
      }

      this.playerActionTimer = undefined;
    }
  }

  private handlePlayerActionTimeout(bettingRoundPlayerId: number) {
    this.cancelPlayerActionTimer();

    console.log('ACTION TIMEOUT', bettingRoundPlayerId);
    // Implement your timeout logic here
    // For example: auto-fold or auto-check depending on the situation
  }

  // Clean up when round ends
  public finish() {
    this.cancelPlayerActionTimer();
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
          cards: [
            deck.draw().toString(),
            deck.draw().toString(),
          ],
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
