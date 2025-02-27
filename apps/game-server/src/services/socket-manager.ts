import { Server } from 'socket.io';
import { createServer } from 'http';
import { db } from '@texas-holdem/database-api';
import { gm } from '../game/game-manager';
import { Player } from '../game/player';

export class SocketManager {
  private static instance: SocketManager;

  private io: Server;

  private httpServer: ReturnType<typeof createServer>;

  private gameRoomConnections: Map<number, { playerId: number; socketId: string }[]> = new Map();

  private constructor(port: number) {
    this.httpServer = createServer();
    this.io = new Server(this.httpServer, { cors: { origin: '*' } });
    this.initialize();
    this.httpServer.listen(port);
  }

  static getInstance(port = 3002) {
    if (!this.instance) {
      this.instance = new SocketManager(port);
    }
    return this.instance;
  }

  private initialize() {
    this.io.emit('game-update', {
      type: 'GAME_STARTED',
      payload: {
        gameId: 1,
        players: [],
      },
    });
    this.io.on('connection', (socket) => {
      socket.on('join-game', async (data: { gameId: number, buyIn: number, userId: number }) => {
        console.log('JOIN GAME ON GAME SERVER', data);
        const game = gm.getGame(data.gameId);
        if (!game) return;

        try {
          // Create new player
          const player = await db.player.create({
            gameId: data.gameId,
            stack: data.buyIn,
            userId: data.userId,
          });

          game.join(new Player(player));

          // Add socket to game room
          const sockets = this.gameRoomConnections.get(data.gameId) || [];
          const existingSocket = sockets.findIndex((s) => s.playerId === player.id);

          if (existingSocket === -1) {
            sockets.push({ playerId: player.id, socketId: socket.id });
          } else {
            sockets[existingSocket].socketId = socket.id;
          }

          this.gameRoomConnections.set(data.gameId, sockets);

          // Notify all players about new player
          this.emitGameEvent(data.gameId, {
            type: 'PLAYER_JOINED',
            payload: {
              playerId: player.id,
              name: player.user.username,
              stack: player.stack,
            },
          });

          if (game.isReadyToStart()) {
            this.emitGameEvent(data.gameId, {
              type: 'ROUND_STARTS_SOON',
            });

            game.startNewRound().then((round) => {
              round.players.forEach((roundPlayer) => {
                console.log('EMITTING ROUND STARTED', roundPlayer);
                this.emitPlayerEvent(
                  game.id,
                  roundPlayer.playerId,
                  {
                    type: 'ROUND_STARTED',
                    payload: {
                      roundId: round.id,
                      cards: roundPlayer.cards,
                    },
                  },
                );
              });
            });
          } else {
            this.emitGameEvent(data.gameId, {
              type: 'WAITING_FOR_PLAYERS',
              payload: {
                gameId: data.gameId,
              },
            });
          }
        } catch (error) {
          console.error('Failed to create player:', error);
          socket.emit('error', 'Failed to join game');
        }
      });

      socket.on('leave-game', (gameId: number) => {
        console.log('LEAVE GAME ON GAME SERVER', gameId);
        const sockets = this.gameRoomConnections.get(gameId);

        if (sockets) {
          this.gameRoomConnections.set(
            gameId,
            sockets.filter((s) => s.socketId !== socket.id),
          );
        }
      });

      socket.on('place-bet', (gameId: number, amount: number) => {
        console.log('PLACE BET ON GAME SERVER', gameId, amount);
      });
    });
  }

  public emitGameEvent(gameId: number, event: unknown) {
    const sockets = this.gameRoomConnections.get(gameId);

    if (sockets) {
      this.io.to(sockets.map((s) => s.socketId)).emit('game-update', event);
    }
  }

  public emitPlayerEvent(gameId: number, playerId: number, event: unknown) {
    const sockets = this.gameRoomConnections.get(gameId) || [];
    const playerSocket = sockets.find((s) => s.playerId === playerId);

    if (playerSocket) {
      this.io.to(playerSocket.socketId).emit('game-update', event);
    }
  }
}

export const socketManager = SocketManager.getInstance();
