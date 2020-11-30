import { Scenario } from '../simulator/scenarios/Scenarios';
import { Simulator } from '../simulator/Simulator';
import { NextTurnState, PlayerActions, VictoryState, isNextTurn, WorldState } from '../simulator/SimulatorState';
import { RecordedInGameEventChoice } from '../simulator/in-game-events/InGameEvents';
import { createGameUI } from './createGameUI';
import { CapabilityImprovements, ContainmentPolicy } from '../simulator/player-actions/PlayerActions';
import { setControlsToTurn, showWinScreen, updateIndicators } from './setGameUI';

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
    private playerTurn: number;
	private gameUI: Object;

    constructor(scenario: Scenario, daysPerTurn: number = 10) {
        this.scenario = scenario;
        this.simulator = new Simulator(scenario, daysPerTurn);
        this.playerTurn = 0;
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
            this.playerTurn += 1;
            const playerActions = this.collectPlayerActions();
            const nextTurn = this.simulator.nextTurn(playerActions);
            this.onNextTurn(nextTurn);
        };

        const onRestart = () => {
            // Quick and dirty restart
            window.location.reload();
        };

        this.gameUI = createGameUI(this.scenario.initialContainmentPolicies, onPlayerSelectsAction, onEndTurn, onRestart);
		console.log(this.simulator);
		this.gameUI.casePlot.appendValues([this.simulator.currentState.indicators.numInfected]);
		this.gameUI.costPlot.appendValues([this.simulator.currentState.indicators.totalCost]);
        setControlsToTurn(0, this.scenario.initialContainmentPolicies);

        updateIndicators(0, this.scenario.initialNumInfected);
    }

    private onNextTurn(nextTurn: NextTurnState | VictoryState) {
        const currentState = this.simulator.state();
        if (isNextTurn(nextTurn)) {
            this.gameUI.casePlot.appendValues([nextTurn.currentState.indicators.numInfected]);
			this.gameUI.costPlot.appendValues([nextTurn.currentState.indicators.totalCost]);
            console.log(`State for day ${nextTurn.currentState.days}`);
            setControlsToTurn(this.playerTurn, this.currentlySelectedActions);
            updateIndicators(nextTurn.currentState.indicators.totalCost, nextTurn.currentState.indicators.numInfected);
        } else {
            const totalCasesReducer = (acc: number, it: WorldState) => acc + it.indicators.numInfected;
            const totalCases = currentState.history.reduce(totalCasesReducer, 0);

            const totalCostReducer = (acc: number, it: WorldState) => acc + it.indicators.totalCost;
            const totalCost = currentState.history.reduce(totalCostReducer, 0);
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
