import { Scenario } from '../simulator/scenarios/Scenarios';
import { Simulator } from '../simulator/Simulator';
import { nFormatter } from '../lib/util';
import { NextTurnState, PlayerActions, VictoryState, isNextTurn } from '../simulator/SimulatorState';
import { InGameEvent, RecordedInGameEventChoice } from '../simulator/in-game-events/InGameEvents';
import { createGameUI } from './createGameUI';
import { CapabilityImprovements, ContainmentPolicy } from '../simulator/player-actions/PlayerActions';
import { setControlsToTurn } from './setGameUI';

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

    public start() {
        this.initUI();
        this.initFirstTurn();
    }

    private initUI() {
        const onPlayerSelectsAction = (action: AvailableActions) => {
            this.currentlySelectedActions[action] = !this.currentlySelectedActions[action];
        };

        const onEndTurn = () => {
            this.playerTurn += 1;
            const playerActions = this.collectPlayerActions();
            const nextTurn = this.simulator.nextTurn(playerActions);
            this.onNextTurn(nextTurn);
        };

        createGameUI(this.scenario.initialContainmentPolicies, onPlayerSelectsAction, onEndTurn);
        setControlsToTurn(0, this.scenario.initialContainmentPolicies);
    }

    private onNextTurn(nextTurn: NextTurnState | VictoryState) {
        if (isNextTurn(nextTurn)) {
            console.log(nextTurn);
            setControlsToTurn(this.playerTurn, this.currentlySelectedActions);
        } else {
            alert('You win!');
        }
    }

    private initFirstTurn() {
        const emptyTurnState = {
            currentState: this.simulator.state().currentState,
            newInGameEvents: [] as InGameEvent[]
        };
        this.onNextTurn(emptyTurnState);
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
