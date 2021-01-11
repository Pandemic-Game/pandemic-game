import { Scenario } from '../simulator/scenarios/Scenarios';
import { NextTurnState, PlayerActions, Indicators, isNextTurn, VictoryState } from '../simulator/SimulatorState';
import { RecordedInGameEventChoice } from '../simulator/in-game-events/InGameEvents';
import { WelcomeEvent, HowToPlayEvent, HowToWinEvent } from '../simulator/in-game-events/WelcomeEvent';
import { createGameUI } from './createGameUI';
import { writeMessageToMessageBox } from './eventsBox';
import { CapabilityImprovements, ContainmentPolicy } from '../simulator/player-actions/PlayerActions';
import { setControlsToTurn, showWinScreen, showLoseScreen, updateIndicators, adjustIndicator, setElectabilityPie } from './setGameUI';
import { months } from '../lib/util';
import { Simulator } from '../simulator/Simulator';
import { GameHistory } from './GameHistory';
import { GameOptions, GameOptionsStore } from './GameOptions';
import { Dictionary } from 'highcharts';

interface CurrentUISelection {
    transport: boolean;
    masks: boolean;
    schools: boolean;
    business: boolean;
}

type AvailableActions = 'transport' | 'masks' | 'schools' | 'business';

/***
 * Class that interfaces the UI code with the simulator. It also keeps track of the history of past games.
 */
export class GameEngine {
    private scenario: Scenario;
    private simulator: Simulator;
    private currentlySelectedActions: CurrentUISelection;
    private gameHistory: GameHistory;
    private gameOptions: GameOptionsStore;

    constructor(scenario: Scenario) {
        this.scenario = scenario;
        this.simulator = new Simulator(scenario);
        this.gameHistory = new GameHistory();
        this.gameOptions = new GameOptionsStore();

        this.currentlySelectedActions = {
            transport: false,
            masks: false,
            schools: false,
            business: false
        };
    }

    start() {
        const onPlayerSelectsAction = (action: AvailableActions) => {
            this.currentlySelectedActions[action] = !this.currentlySelectedActions[action];
        };

        const toggleWelcomeScreen = (showWelcomeScreenAtStart: boolean) => {
            this.gameOptions.setGameOptions({ showWelcomeScreenAtStart });
        };

        const onEndTurn = () => {
            const month = months[this.simulator.lastTurn() % months.length];
            const playerActions = this.collectPlayerActions();
            const timeStep = 10;
            const nextTurn = this.simulator.nextTurn(playerActions, this.scenario.game_time_step);
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
            onPlayAgain,
            { // electability
                maxSupporters: this.simulator.currentTurn.indicators.maxSupporters,
                publicSupport: this.simulator.currentTurn.indicators.publicSupport,
                businessSupport: this.simulator.currentTurn.indicators.businessSupport,
                healthcareSupport: this.simulator.currentTurn.indicators.healthcareSupport
            }
        );
        setControlsToTurn(0, this.currentlySelectedActions, [], this.scenario.initialContainmentPolicies);
        const history = this.simulator.history(); // In the first turn total history is the last month history
        updateIndicators(0, history, history);


        // Send welcome messages
        setTimeout(function(){

            writeMessageToMessageBox(WelcomeEvent);
            
            setTimeout(function(){

                writeMessageToMessageBox(HowToWinEvent);

                setTimeout(function(){

                    writeMessageToMessageBox(HowToPlayEvent);


                }, 1000)
            }, 1000)
        }, 1000)
    }

    private undoLastTurn() {
        const lastState = this.simulator.state();
        const targetTurn = this.simulator.lastTurn();
        if (targetTurn >= 0) {
            // Map the previous player actions to the format used in the frontend
            const prevContainmentPolicies = lastState.currentTurn.playerActions.containmentPolicies;
            const prevChoices: CurrentUISelection = {
                transport: false,
                masks: false,
                schools: false,
                business: false
            };

            prevContainmentPolicies.forEach((it) => {
                prevChoices[it.id as AvailableActions] = true;
            });

            // Go back to the last turn
            this.simulator = this.simulator.reset(targetTurn);
            this.currentlySelectedActions = prevChoices;
            const simulatorState = this.simulator.state();
            const updatedTurn = this.simulator.lastTurn();

            // Reset the controls
            setControlsToTurn(
                updatedTurn,
                this.currentlySelectedActions,
                simulatorState.currentTurn.nextInGameEvents,
                this.scenario.initialContainmentPolicies
            );
            const lastTurnHistory = updatedTurn > 0 ? simulatorState.timeline[updatedTurn - 1].history : [];
            updateIndicators(updatedTurn, simulatorState.history, lastTurnHistory);
        }
    }
	
	updateSize(){
		const updatedTurn = this.simulator.lastTurn();
		adjustIndicator(updatedTurn,false);
	}

    /**
     * Processes the next turn of the game that can be either a next turn or a victory state
     */
    private onNextTurn(nextTurn: NextTurnState | VictoryState) {

        // Save current game state
        const history = this.simulator.history();
        const currentTurn = this.simulator.lastTurn();

        // Show this turn to the player
        if (isNextTurn(nextTurn)) {

            // Check that player's electability is high enough
            const indicators = this.simulator.currentTurn.indicators;
            if(indicators.publicSupport <= 0 || indicators.businessSupport <= 0 || indicators.healthcareSupport <= 0){
                
                // Player's electability fell too low this turn. Render the lose screen
                this.prepareLoseScreen(
                    currentTurn, 
                    history, 
                    nextTurn,
                    indicators.maxSupporters, 
                    indicators.publicSupport, 
                    indicators.businessSupport, 
                    indicators.healthcareSupport
                );
            }

            // Just another turn. Update the controls and indicators
            this.prepareNextTurn(currentTurn, nextTurn, history);

        } else {

            // Player stayed in office until the end date. Render the win screen
            this.prepareWinScreen(currentTurn, history, nextTurn);

        }
    }

    /**
     * Prepares the UI for the next turn of the game
     */
    private prepareNextTurn(currentTurn: number, nextTurn: NextTurnState, history: Indicators[]) {
        
        // Set controls
        setControlsToTurn(
            currentTurn,
            this.currentlySelectedActions,
            nextTurn.newInGameEvents,
            this.scenario.initialContainmentPolicies
        );

        // Update indicators for economy and cases
        updateIndicators(currentTurn, history, nextTurn.lastTurnIndicators);

        // Update pie chart
        const indicators = this.simulator.currentTurn.indicators;
        setElectabilityPie({
            maxSupporters: indicators.maxSupporters,
            publicSupport: indicators.publicSupport,
            businessSupport: indicators.businessSupport,
            healthcareSupport: indicators.healthcareSupport
        });
    }

    /**
     * Prepares the win screen.
     */
    private prepareWinScreen(currentTurn: number, history: Indicators[], nextTurn: VictoryState) {
        
        // Update indicators and chart
        updateIndicators(currentTurn, history, nextTurn.lastTurnIndicators);
        const indicators = this.simulator.currentTurn.indicators;
        setElectabilityPie({ // Update pie chart
            maxSupporters: indicators.maxSupporters,
            publicSupport: indicators.publicSupport,
            businessSupport: indicators.businessSupport,
            healthcareSupport: indicators.healthcareSupport
        });

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
				totalDead: it.history.reduce(totalDeadReducer, 0),
            };
        });

        showWinScreen(totalCost, totalCases, totalDead, prevGames);
    }

    private prepareLoseScreen(
        currentTurn: number, 
        history: Indicators[], 
        nextTurn: VictoryState, 
        maxSupporters: number,
        publicSupport: number,
        businessSupport: number,
        healthcareSupport: number) {

        // Update indicators and chart
        updateIndicators(currentTurn, history, nextTurn.lastTurnIndicators);
        const indicators = this.simulator.currentTurn.indicators;
        setElectabilityPie({ // Update pie chart
            maxSupporters: indicators.maxSupporters,
            publicSupport: indicators.publicSupport,
            businessSupport: indicators.businessSupport,
            healthcareSupport: indicators.healthcareSupport
        });

        // Show the lose screen
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
				totalDead: it.history.reduce(totalDeadReducer, 0),
            };
        });

        showLoseScreen(totalCost, totalCases, totalDead, prevGames, {
            maxSupporters: maxSupporters,
            publicSupport: publicSupport,
            businessSupport: businessSupport,
            healthcareSupport: healthcareSupport
        });
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
            containmentPolicies: [] as ContainmentPolicy[],
            capabilityImprovements: [] as CapabilityImprovements[],
            inGameEventChoices: [] as RecordedInGameEventChoice[]
        };

        for (let k in this.currentlySelectedActions) {
            if (this.currentlySelectedActions[k as AvailableActions]) {
                const containmentPolicy = this.scenario.initialContainmentPolicies.find((cp) => cp.id === k);
                if (containmentPolicy) {
                    result.containmentPolicies.push(containmentPolicy);
                }
            }
        }

        return result;
    }
}
