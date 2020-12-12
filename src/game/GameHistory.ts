import { Simulator } from '@src/simulator/Simulator';
import { SimulatorState } from '@src/simulator/SimulatorState';

/**
 * This class acts as a repository of past games enabling comparisons across playthroughs.
 * If behaves as a FIFO queue of games with a user defined limit.
 */
export class GameHistory {
    private maxHistorySize: number;
    private storageEngine: Storage;
    private historyKey: string;

    constructor(maxHistorySize = 3) {
        this.maxHistorySize = maxHistorySize;
        this.historyKey = 'gameHistory';
        this.storageEngine = window.sessionStorage;
        if (this.storageIsEmpty()) {
            this.storageEngine.setItem(this.historyKey, '[]'); // init with an empty array
        }
    }

    saveGame(gameState: SimulatorState) {
        const parsedItems = this.getPreviousGames();

        if (parsedItems.length === this.maxHistorySize) {
            parsedItems.splice(0, 1); // Behaves like a fifo-queue
        }

        parsedItems.push(gameState);
        this.storageEngine.setItem(this.historyKey, JSON.stringify(parsedItems));
    }

    getPreviousGames(): SimulatorState[] {
        const rawItems = this.storageEngine.getItem(this.historyKey);
        return JSON.parse(rawItems) as SimulatorState[];
    }

    private storageIsEmpty(): boolean {
        return this.storageEngine.getItem(this.historyKey) === null;
    }
}
