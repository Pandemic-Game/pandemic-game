import { Scenario } from '../simulator/scenarios/Scenarios';
import { NextTurnState, PlayerActions, Indicators, isNextTurn, VictoryState } from '../simulator/SimulatorState';
import { RecordedInGameEventChoice } from '../simulator/in-game-events/InGameEvents';
import { createGameUI } from './createGameUI';
import { CapabilityImprovements, ContainmentPolicy } from '../simulator/player-actions/PlayerActions';
import { setControlsToTurn, showWinScreen, updateIndicators } from './setGameUI';
import { months } from '../lib/util';
import { Simulator } from '../simulator/Simulator';
import { WelcomeEvent } from '../simulator/in-game-events/WelcomeEvent';

interface CurrentUISelection {
    transport: boolean;
    masks: boolean;
    schools: boolean;
    business: boolean;
}

type AvailableActions = 'transport' | 'masks' | 'schools' | 'business';

export class GameEngine {
    private scenario: Scenario;
    private simulator: Simulator;
    private currentlySelectedActions: CurrentUISelection;

    constructor(scenario: Scenario) {
        this.scenario = scenario;
        this.simulator = new Simulator(scenario);
		console.log(this.simulator.scenario.hospitalCapacity);
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

        createGameUI(this.scenario.initialContainmentPolicies, onPlayerSelectsAction, onEndTurn, onUndo, onRestart);
        setControlsToTurn(
            0,
            this.scenario.initialContainmentPolicies,
            [WelcomeEvent],
            this.scenario.initialContainmentPolicies
        );
        updateIndicators(this.simulator.history(),this.simulator.scenario);
    }

    private undoLastTurn() {
        const lastState = this.simulator.state();
        if (this.simulator.lastTurn() >= 0) {
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

            this.simulator = this.simulator.reset(this.simulator.lastTurn());
            this.currentlySelectedActions = prevChoices;

            const simulatorState = this.simulator.state();
            setControlsToTurn(
                this.simulator.lastTurn(),
                this.currentlySelectedActions,
                simulatorState.currentTurn.nextInGameEvents,
                this.scenario.initialContainmentPolicies
            );
            updateIndicators(this.simulator.history());
        }
    }

    private onNextTurn(nextTurn: NextTurnState | VictoryState) {
        const history = this.simulator.history();
        if (isNextTurn(nextTurn)) {
            // Just another turn. Update the controls and indicators
            setControlsToTurn(
                this.simulator.lastTurn(),
                this.currentlySelectedActions,
                nextTurn.newInGameEvents,
                this.scenario.initialContainmentPolicies
            );
            updateIndicators(history);
        } else {
            // Do the final graph update
            updateIndicators(history);

            // Show the win screen
            const totalCasesReducer = (acc: number, it: Indicators) => acc + it.numInfected;
            const totalCases = history.reduce(totalCasesReducer, 0);
            const totalCostReducer = (acc: number, it: Indicators) => acc + it.totalCost;
            const totalCost = history.reduce(totalCostReducer, 0);
            showWinScreen(totalCost, totalCases);
        }
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
