import { Scenario } from '../simulator/scenarios/Scenarios';
import { Simulator } from '../simulator/Simulator';
import { NextTurnState, PlayerActions, VictoryState, isNextTurn, Indicators } from '../simulator/SimulatorState';
import { RecordedInGameEventChoice } from '../simulator/in-game-events/InGameEvents';
import { createGameUI } from './createGameUI';
import { CapabilityImprovements, ContainmentPolicy } from '../simulator/player-actions/PlayerActions';
import { setControlsToTurn, showWinScreen, updateIndicators } from './setGameUI';
import { months } from '../lib/util';

interface CurrentUISelection {
    transit: boolean;
    masks: boolean;
    schools: boolean;
    business: boolean;
}

type AvailableActions = 'transit' | 'masks' | 'schools' | 'business';

export class GameEngine {
    private scenario: Scenario;
    private simulator: Simulator;
    private currentlySelectedActions: CurrentUISelection;

    constructor(scenario: Scenario) {
        this.scenario = scenario;
        this.simulator = new Simulator(scenario);
        this.currentlySelectedActions = {
            transit: false,
            masks: false,
            schools: false,
            business: false
        };
    }

    start() {
        const onPlayerSelectsAction = (action: AvailableActions) => {
            this.currentlySelectedActions[action] = !this.currentlySelectedActions[action];
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

        const onRestart = () => {
            // Quick and dirty restart
            window.location.reload();
        };

        const initialState = this.simulator.state();
        createGameUI(this.scenario.initialContainmentPolicies, onPlayerSelectsAction, onEndTurn, onUndo, onRestart);
        setControlsToTurn(0, this.scenario.initialContainmentPolicies);
        updateIndicators(0, initialState.history);
    }

    private undoLastTurn() {
        const lastState = this.simulator.state();
        if (this.simulator.lastTurn() > 0) {
            this.simulator = this.simulator.reset(this.simulator.lastTurn());
            this.currentlySelectedActions = {
                transit: false,
                masks: false,
                schools: false,
                business: false
            };

            setControlsToTurn(this.simulator.lastTurn(), this.currentlySelectedActions);
            updateIndicators(this.simulator.lastTurn(), lastState.history);
            console.log(`Reverting to turn ${this.simulator.lastTurn()}`);
            console.log(this.simulator.state());
        }
    }

    private onNextTurn(nextTurn: NextTurnState | VictoryState) {
        const simulatorState = this.simulator.state();
        if (isNextTurn(nextTurn)) {
            // Just another turn. Update the controls and indicators
            setControlsToTurn(this.simulator.lastTurn(), this.currentlySelectedActions);
            updateIndicators(this.simulator.lastTurn(), simulatorState.history);
        } else {
            // Do the final graph update
            updateIndicators(this.simulator.lastTurn(), simulatorState.history);

            // Show the win screen
            const totalCasesReducer = (acc: number, it: Indicators) => acc + it.numInfected;
            const totalCases = simulatorState.history.reduce(totalCasesReducer, 0);
            const totalCostReducer = (acc: number, it: Indicators) => acc + it.totalCost;
            const totalCost = simulatorState.history.reduce(totalCostReducer, 0);
            showWinScreen(totalCost, totalCases);
        }
        console.log(`Turn ${this.simulator.lastTurn()}, done`);
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
