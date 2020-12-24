import { Scenario } from '../simulator/scenarios/Scenarios';
import { NextTurnState, PlayerActions, Indicators, isNextTurn, VictoryState } from '../simulator/SimulatorState';
import { createGameUI } from './createGameUI';
import {
    setControlsToTurn,
    showWinScreen,
    updateIndicators,
    adjustIndicator,
    updatePreviousGameIndicators
} from './setGameUI';
import { months } from '../lib/util';
import { Simulator } from '../simulator/Simulator';
import { GameHistory } from './GameHistory';
import { GameOptionsStore } from './GameOptions';
import { PlayerContainmentPolicyChoice } from '@src/simulator/player-actions/PlayerActions';
import { isNumber } from 'highcharts';

/***
 * Class that interfaces the UI code with the simulator. It also keeps track of the history of past games.
 */
export class GameEngine {
    private scenario: Scenario;
    private simulator: Simulator;
    private currentlySelectedActions: Map<string, any>;
    private gameHistory: GameHistory;
    private gameOptions: GameOptionsStore;

    constructor(scenario: Scenario) {
        this.scenario = scenario;
        this.simulator = new Simulator(scenario);
        this.gameHistory = new GameHistory();
        this.gameOptions = new GameOptionsStore();
        this.currentlySelectedActions = new Map<string, any>();
    }

    start() {
        const onPlayerSelectsAction = (containmentPolicyId: string, selectedOption: any) => {
            this.currentlySelectedActions.set(containmentPolicyId, selectedOption);
        };

        const toggleWelcomeScreen = (showWelcomeScreenAtStart: boolean) => {
            this.gameOptions.setGameOptions({ showWelcomeScreenAtStart });
        };

        const onEndTurn = () => {
            const month = months[this.simulator.lastTurn() % months.length];
            const playerActions = this.collectPlayerActions();
            const nextTurn = this.simulator.nextTurn(playerActions, month.numDays);
            this.onNextTurn(nextTurn);
        };

        const onUndo = () => {
            this.undoLastTurn();
        };

        const onPlayAgain = () => {
            this.onPlayAgain();
        };

        createGameUI(
            this.gameOptions.getGameOptions(),
            this.scenario.initialContainmentPolicies,
            toggleWelcomeScreen,
            onPlayerSelectsAction,
            onEndTurn,
            onUndo,
            onPlayAgain
        );
        setControlsToTurn(0, this.currentlySelectedActions, []);
        const history = this.simulator.history(); // In the first turn total history is the last month history
        updateIndicators(0, history, history, this.scenario.hospitalCapacity);

        const previousGames = this.gameHistory.getPreviousGames();
        if (previousGames.length > 0) {
            updatePreviousGameIndicators(previousGames[previousGames.length - 1].timeline);
        }
    }

    updateSize() {
        const updatedTurn = this.simulator.lastTurn();
        adjustIndicator(updatedTurn, false);
    }

    private undoLastTurn() {
        const lastState = this.simulator.state();
        const targetTurn = this.simulator.lastTurn();
        if (targetTurn >= 0) {
            // Map the previous player actions to the format used in the frontend
            const prevContainmentPolicies = lastState.currentTurn.playerActions.containmentPolicies;
            const prevChoices = new Map<string, any>();

            prevContainmentPolicies.forEach((it) => {
                prevChoices.set(it.containmentPolicyId, it.selectedOption);
            });

            // Go back to the last turn

            this.simulator = this.simulator.reset(targetTurn);
            this.currentlySelectedActions = prevChoices;
            const simulatorState = this.simulator.state();
            const updatedTurn = this.simulator.lastTurn();
            // Reset the controls
            setControlsToTurn(updatedTurn, this.currentlySelectedActions, simulatorState.currentTurn.nextInGameEvents);
            const lastTurnHistory = updatedTurn > 0 ? simulatorState.timeline[updatedTurn - 1].history : [];
            updateIndicators(updatedTurn, simulatorState.history, lastTurnHistory, this.scenario.hospitalCapacity);
        }
    }

    /**
     * Processes the next turn of the game that can be either a next turn or a victory state
     */
    private onNextTurn(nextTurn: NextTurnState | VictoryState) {
        const history = this.simulator.history();
        const currentTurn = this.simulator.lastTurn();
        if (isNextTurn(nextTurn)) {
            // Just another turn. Update the controls and indicators
            this.prepareNextTurn(currentTurn, nextTurn, history);
        } else {
            // Render the win screen
            this.prepareWinScreen(currentTurn, history, nextTurn);
        }
    }

    /**
     * Prepares the UI for the next turn of the game
     */
    private prepareNextTurn(currentTurn: number, nextTurn: NextTurnState, history: Indicators[]) {
        setControlsToTurn(currentTurn, this.currentlySelectedActions, nextTurn.newInGameEvents);
        updateIndicators(currentTurn, history, nextTurn.lastTurnIndicators, this.scenario.hospitalCapacity);
    }

    /**
     * Prepares the win screen.
     */
    private prepareWinScreen(currentTurn: number, history: Indicators[], nextTurn: VictoryState) {
        updateIndicators(currentTurn, history, nextTurn.lastTurnIndicators, this.scenario.hospitalCapacity);

        // Show the win screen
        const totalCasesReducer = (acc: number, it: Indicators) => acc + it.numInfected;
        const totalCases = history.reduce(totalCasesReducer, 0);
        const totalDeadReducer = (acc: number, it: Indicators) => acc + it.numDead;
        const totalDead = history.reduce(totalDeadReducer, 0);
        const totalCostReducer = (acc: number, it: Indicators) => acc + it.totalCost;
        const totalCost = history.reduce(totalCostReducer, 0);

        const prevGames = this.gameHistory.getPreviousGames().map((it) => {
            return {
                totalCases: it.history.reduce(totalCasesReducer, 0),
                totalCost: it.history.reduce(totalCostReducer, 0),
                totalDead: it.history.reduce(totalDeadReducer, 0)
            };
        });

        showWinScreen(totalCost, totalCases, totalDead, prevGames);
    }

    /**
     * Saves the current game in the history, and resets the game.
     */
    private onPlayAgain() {
        this.gameHistory.saveGame(this.simulator.state());
        window.location.reload();
    }

    private collectPlayerActions(): PlayerActions {
        const result = {
            containmentPolicies: [] as PlayerContainmentPolicyChoice<any>[]
        };

        this.currentlySelectedActions.forEach((v, k) => {
            // do some data type conversions
            let convertedValue = v; // default is string

            // Ensure the types are correctly cast for the simulator.
            if (typeof v === 'string') {
                if (v === 'true') {
                    convertedValue = true;
                } else if (v === 'false') {
                    convertedValue = false;
                } else {
                    const numericConversion = parseInt(v, 10);
                    if (!isNaN(numericConversion)) {
                        convertedValue = numericConversion;
                    }
                }
            }
            result.containmentPolicies.push({
                selectedOption: convertedValue,
                containmentPolicyId: k
            });
        });

        return result;
    }
}
