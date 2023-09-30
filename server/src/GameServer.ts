import { Player } from './Player';
import { PokerTable } from './PokerTable';

export class GameServer {
    private tables: PokerTable[] = [];

    public async initialize() {
        // TODO: FETCH RUNNING TABLES FROM DATABASE
        const player = new Player(1);
        this.tables.push(new PokerTable([player]));

        setInterval(() => {
            console.log('Tables', this.tables.map((table) => table.players[0].id).join(' '));
            this.tables.push(new PokerTable([new Player(this.tables.length + 1)]));
        }, 1000);
    }
}
