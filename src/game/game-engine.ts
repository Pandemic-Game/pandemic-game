import { Scenario } from '../simulator/scenarios/Scenarios';
import { Simulator } from '../simulator/Simulator';
import { nFormatter, sum } from '../lib/util';
import * as $ from 'jquery'
import { NextTurnState, PlayerActions, VictoryState, WorldState } from '@src/simulator/SimulatorState';
import { InGameEvent } from '@src/simulator/in-game-events/InGameEvents';

const isNextTurn = (nextTurn: NextTurnState | VictoryState): nextTurn is NextTurnState => {
    return (nextTurn as any)?.currentState !== undefined;
}

export class GameEngine {

    private scenario: Scenario;
    private simulator: Simulator;

    constructor(scenario: Scenario) {
        this.scenario = scenario;
        this.simulator = new Simulator(scenario);
    }

    public start() {
        this.initEventHandlers();
        this.initFirstTurn();
    }

    private initEventHandlers() {
        $("#next-turn").on("click", (e: any) => {
            const playerActions = this.collectPlayerActions();
            const nextTurn = this.simulator.nextTurn(playerActions);
            this.onNextTurn(nextTurn);
        });
    }

    private onNextTurn(nextTurn: NextTurnState | VictoryState) {
        if (isNextTurn(nextTurn)) {
            const totalCasesReducer = (acc: number, it: WorldState) => acc + it.indicators.numInfected
            const totalCases = this.simulator.state().history.reduce(totalCasesReducer, 0)

            const totalCostReducer = (acc: number, it: WorldState) => acc + it.indicators.totalCost
            const totalCost = this.simulator.state().history.reduce(totalCostReducer, 0)
            $("#current-day").html(`${nextTurn.currentState.days}`);
            $("#total-cases").html(`${nFormatter(totalCases, 3)}`);
            $("#total-cost").html(`${nFormatter(totalCost, 3)} USD`);
        } else {
            alert("You win!");
        }

    }

    private initFirstTurn() {
        const emptyTurnState = {
            currentState: this.simulator.state().currentState,
            newInGameEvents: [] as InGameEvent[]
        }
        this.onNextTurn(emptyTurnState);
    }

    private collectPlayerActions(): PlayerActions {
        return {
            containmentPolicies: [],
            capabilityImprovements: [],
            inGameEventChoices: []
        }
    }
}
