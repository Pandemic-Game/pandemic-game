import { CapabilityImprovements, ContainmentPolicy } from './player-actions/PlayerActions';
import { InGameEvent } from './in-game-events/InGameEvents';
import { Indicators, NextTurnState, PlayerActions } from './SimulatorState';
import { FakeNegativeBinomial } from '../lib/Probabilities';
import { Scenario } from './scenarios/Scenarios';
import { VictoryCondition } from './victory-conditions/VictoryConditon';
import cloneDeep from 'lodash/cloneDeep';

interface TurnHistoryEntry2 {
    availablePlayerActions: {
        containmentPolicies: ContainmentPolicy[];
        capabilityImprovements: CapabilityImprovements[];
    };
    nextInGameEvents: InGameEvent[];
    playerActions: PlayerActions;
}

type WorldState = { lastIndicators: Indicators } & TurnHistoryEntry2;
type TimelineEntry = { history: Indicators[] } & TurnHistoryEntry2;

export interface SimulatorState2 {
    scenario: Scenario;
    currentTurn: TurnHistoryEntry2;
    timeline: TimelineEntry[];
    history: Indicators[];
}

export interface VictoryState2 {
    simulatorState: SimulatorState2;
    victoryCondition: VictoryCondition;
    score: number;
}

export class Simulator2 {
    private scenario: Scenario;
    private scaleFactor: number;
    private currentTurn: WorldState;
    private timeline: TimelineEntry[];

    constructor(scenario: Scenario) {
        this.scenario = scenario;
        this.scaleFactor = scenario.gdpPerDay * 0.2;
        this.currentTurn = this.computeInitialWorldState();
        this.timeline = [];
    }

    reset(turn: number = 0): Simulator2 {
        const newSimulator = new Simulator2(this.scenario);
        const baseline = turn - 1;
        if (baseline > 0 && this.timeline.length >= baseline) {
            const targetTurn = this.timeline[baseline - 1];
            newSimulator.timeline = this.clone(this.timeline.slice(0, baseline));

            const history = newSimulator.history();
            newSimulator.currentTurn = this.clone({
                ...targetTurn,
                lastIndicators: history[history.length - 1]
            });
        } else {
            newSimulator.timeline = [];
            newSimulator.currentTurn = this.computeInitialWorldState();
        }

        return newSimulator;
    }

    lastTurn(): number {
        return this.timeline.length;
    }

    /**
     * Allows the caller to obtain a snapshot of the current simulator state.
     */
    state(): SimulatorState2 {
        const simulatorStateSnapshot: SimulatorState2 = {
            scenario: this.scenario,
            currentTurn: this.currentTurn,
            timeline: this.timeline,
            history: this.history()
        };
        // Return an immutable copy of the state.
        return this.clone(simulatorStateSnapshot);
    }

    history(): Indicators[] {
        return this.timeline.flatMap((it) => it.history);
    }

    /**
     * Processes the next turn by computing the effects of player actions, random events and the natural
     * progression of the epidemic.
     */
    nextTurn(playerActions: PlayerActions, daysToAdvance: number = 1): NextTurnState | VictoryState2 {
        // Store player previous player turn
        let nextTurnCandidate = this.clone(this.currentTurn);
        // Reset the baseline R for the turn
        nextTurnCandidate.lastIndicators.r = this.scenario.r0;

        // Factor in any new player actions.
        const newContainmentPolicies: ContainmentPolicy[] = this.findNewContainmentPolicies(
            playerActions.containmentPolicies
        );
        for (const containmentPolicy of newContainmentPolicies) {
            nextTurnCandidate.lastIndicators = containmentPolicy.immediateEffect(nextTurnCandidate);
        }

        // Factor in the recurring effects of existing player actions.
        for (const containmentPolicy of playerActions.containmentPolicies) {
            nextTurnCandidate.lastIndicators = containmentPolicy.recurringEffect(nextTurnCandidate);
        }

        // Add the new containment policies to the history of player actions
        nextTurnCandidate.playerActions.containmentPolicies = playerActions.containmentPolicies;

        // Add any new random events that will trigger on the next turn
        nextTurnCandidate.nextInGameEvents = [];

        // Advance world timeline the desired number of days
        let nextIndicators;
        let prevIndicators = this.currentTurn.lastIndicators;
        let history = [];
        for (let i = 0; i < daysToAdvance; i++) {
            nextIndicators = this.computeNextPandemicDay(nextTurnCandidate, prevIndicators);
            prevIndicators = nextIndicators;
            // Add the last indicators to the world timeline.
            history.push(this.clone(nextIndicators));
        }

        // Update the next turn's indicators
        nextTurnCandidate.lastIndicators = nextIndicators;

        this.currentTurn = nextTurnCandidate;
        this.timeline.push(
            this.clone({
                ...nextTurnCandidate,
                history: history
            })
        );

        // Check if victory conditions are met.
        const victoryCondition = this.isVictorious();
        if (victoryCondition) {
            return this.computeVictory(victoryCondition);
        } else {
            return this.clone({
                newInGameEvents: nextTurnCandidate.nextInGameEvents,
                latestIndicators: nextIndicators
            });
        }
    }

    private isVictorious(): VictoryCondition | undefined {
        return this.scenario.victoryConditions.find((it) =>
            it.isMet({
                scenario: this.scenario,
                currentTurn: this.currentTurn,
                timeline: this.timeline,
                history: this.history()
            })
        );
    }

    private computeVictory(victoryCondition: VictoryCondition): VictoryState2 {
        return {
            simulatorState: this.state(),
            score: 0,
            victoryCondition: victoryCondition
        };
    }

    private computeNextPandemicDay(candidateState: WorldState, lastResult: Indicators): Indicators {
        let actionR = candidateState.lastIndicators.r;
        const prevCases = lastResult.numInfected;

        // Don't allow cases to exceed hospital capacity
        const hospitalCapacity = lastResult.hospitalCapacity;
        const lockdownRatio = hospitalCapacity / prevCases;
        const cappedActionR = prevCases * actionR >= hospitalCapacity ? lockdownRatio : actionR;
        actionR = cappedActionR;

        // Compute next state
        let new_num_infected = this.generateNewCasesFromDistribution(prevCases, actionR);
        new_num_infected = Math.max(Math.floor(new_num_infected), 0);
        new_num_infected = Math.min(new_num_infected, this.scenario.totalPopulation);
        // Deaths from infections started 20 days ago

        const lag = 20;
        const history = this.history();
        const long_enough = history.length >= lag;
        const mortality = this.scenario.mortality;
        const new_deaths_lagging = long_enough ? history[history.length - lag].numInfected * mortality : 0;

        const currentDay = lastResult.days + 1;
        const deathCosts = this.computeDeathCost(new_deaths_lagging);
        const economicCosts = this.computeEconomicCosts(actionR);
        const medicalCosts = this.computeHospitalizationCosts(new_num_infected);
        return {
            days: currentDay,
            numDead: new_deaths_lagging,
            numInfected: new_num_infected,
            totalPopulation: this.scenario.totalPopulation,
            hospitalCapacity: this.scenario.hospitalCapacity,
            r: candidateState.lastIndicators.r,
            importedCasesPerDay: this.scenario.importedCasesPerDay,
            deathCosts: deathCosts,
            economicCosts: economicCosts,
            medicalCosts: medicalCosts,
            totalCost: deathCosts + economicCosts + medicalCosts
        };
    }

    private computeInitialWorldState(): WorldState {
        // TODO: The hospitalization costs will not be zero on the first turn!
        const deathCosts = this.computeDeathCost(0);
        const economicCosts = this.computeEconomicCosts(this.scenario.r0);
        const medicalCosts = this.computeHospitalizationCosts(this.scenario.initialNumInfected);
        return {
            availablePlayerActions: {
                capabilityImprovements: this.scenario.initialCapabilityImprovements,
                containmentPolicies: this.scenario.initialContainmentPolicies
            },
            lastIndicators: {
                days: 0,
                numDead: 0,
                numInfected: this.scenario.initialNumInfected,
                totalPopulation: this.scenario.totalPopulation,
                hospitalCapacity: this.scenario.hospitalCapacity,
                r: this.scenario.r0,
                importedCasesPerDay: this.scenario.importedCasesPerDay,
                deathCosts: deathCosts,
                economicCosts: economicCosts,
                medicalCosts: medicalCosts,
                totalCost: deathCosts + economicCosts + medicalCosts
            },
            playerActions: {
                capabilityImprovements: [],
                containmentPolicies: [],
                inGameEventChoices: []
            },
            nextInGameEvents: []
        };
    }

    private computeDeathCost(numDead: number): number {
        const cost_per_death = 1e7; // https://www.npr.org/transcripts/835571843: value of a statistical life
        return numDead * cost_per_death;
    }

    private computeHospitalizationCosts(numInfected: number): number {
        const hospitalization_rate = 0.1; // 10% of those infected will require hospitalization
        const num_hospitalizations = numInfected * hospitalization_rate;
        const cost_per_hospitalization = 50000; // $50,000 per hospital visit -- average amount billed to insurance (can dig up this reference if needed; it was on this order of magnitude)

        return num_hospitalizations * cost_per_hospitalization;
    }

    private computeEconomicCosts(r: number): number {
        debugger;
        if (r >= this.scenario.r0) {
            return 0;
        }

        debugger;
        return (this.scaleFactor * (this.scenario.r0 ** 10 - r ** 10)) / this.scenario.r0 ** 10;
    }

    private generateNewCasesFromDistribution(num_infected: number, action_r: number) {
        const lam = this.generateNewCases(num_infected, action_r);
        const r = 50.0;
        const p = lam / (r + lam);
        const new_num_infected = new FakeNegativeBinomial(r, p).sample();
        return new_num_infected;
    }

    private generateNewCases(numInfected: number, r: number) {
        const fractionSusceptible = 1; // immune population?
        const expectedNewCases =
            numInfected * r * fractionSusceptible + this.currentTurn.lastIndicators.importedCasesPerDay;
        return expectedNewCases;
    }

    private findNewContainmentPolicies(containmentPoliciesOfTurn: ContainmentPolicy[]): ContainmentPolicy[] {
        const previousPolicies = this.currentTurn.playerActions.containmentPolicies.map((it) => it.name);
        return containmentPoliciesOfTurn.filter(
            (containmentPolicy) => previousPolicies.indexOf(containmentPolicy.name) == -1
        );
    }

    private clone<T>(obj: T): T {
        return cloneDeep(obj);
    }
}
