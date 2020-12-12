export interface GameOptions {
    showWelcomeScreenAtStart: boolean;
}

const defaultGameOptions = { showWelcomeScreenAtStart: true };

export class GameOptionsStore {
    private optionStore: Storage;
    private gameOptionKey: string;

    constructor() {
        this.optionStore = window.sessionStorage;
        this.gameOptionKey = 'gameOptions';
    }

    setGameOptions(gameOptions: GameOptions) {
        this.optionStore.setItem(this.gameOptionKey, JSON.stringify(gameOptions));
    }

    getGameOptions(): GameOptions {
        const rawGameOptions = this.optionStore.getItem(this.gameOptionKey);
        if (rawGameOptions === null) {
            return defaultGameOptions;
        } else {
            return JSON.parse(rawGameOptions) as GameOptions;
        }
    }
}
