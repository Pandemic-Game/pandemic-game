import { CapabilityImprovements, ContainmentPolicy } from './player-actions/PlayerActions';
import { InGameEvent } from './in-game-events/InGameEvents';
import {
    Indicators,
    NextTurnState,
    PlayerActions,
    SimulatorState,
    TurnHistoryEntry,
    VictoryState
} from './SimulatorState';
import { FakeNegativeBinomial } from '../lib/Probabilities';
import { Scenario } from './scenarios/Scenarios';
import { VictoryCondition } from './victory-conditions/VictoryConditon';
import cloneDeep from 'lodash/cloneDeep';

type WorldState = { indicators: Indicators } & TurnHistoryEntry;

export class Simulator {
    private scenario: Scenario;
    private scaleFactor: number;
    private currentState: WorldState;
    private turnHistory: TurnHistoryEntry[];
    private history: Indicators[];

    constructor(scenario: Scenario) {
        this.scenario = scenario;
        this.scaleFactor = scenario.gdpPerDay * 0.2;
        this.currentState = this.computeInitialWorldState();
        this.history = [this.currentState.indicators];
        this.turnHistory = [];
    }

    /**
     * Restarts the scenario at a given turn (turn zero by default).
     * Returns a new simulator instance.
     */
    reset(turn: number = 0): Simulator {
        const newSimulator = new Simulator(this.scenario);
        if (turn > 0 && this.turnHistory.length >= turn) {
            const prevTurn = turn - 1;
            const targetTurn = this.turnHistory[prevTurn];
            newSimulator.turnHistory = this.clone(this.turnHistory.slice(0, prevTurn));

            const maxDay = targetTurn.worldHistoryStartIndex;
            newSimulator.history = this.clone(this.history.slice(0, maxDay));

            newSimulator.currentState = this.clone({
                ...targetTurn,
                indicators: this.history[maxDay]
            });
        } else {
            newSimulator.turnHistory = [];
            newSimulator.history = this.clone([this.history[0]]);
            newSimulator.currentState = this.clone({
                ...this.turnHistory[0],
                indicators: this.history[0]
            });
        }

        return newSimulator;
    }

    /**
     * Allows the caller to obtain a snapshot of the current simulator state.
     */
    state(): SimulatorState {
        const simulatorStateSnapshot: SimulatorState = {
            scenario: this.scenario,
            playerActionHistory: this.turnHistory,
            history: this.history
        };
        // Return an immutable copy of the state.
        return this.clone(simulatorStateSnapshot);
    }

    /**
     * Returns the last turn numbner
     */
    lastTurn(): number {
        return this.currentState.turn
    }

    /**
     * Processes the next turn by computing the effects of player actions, random events and the natural
     * progression of the epidemic.
     */
    nextTurn(playerActions: PlayerActions, daysToAdvance: number = 1): NextTurnState | VictoryState {
        // Store player previous player turn
        let nextStateCandidate = this.clone(this.currentState);
        // Reset the baseline R for the turn
        nextStateCandidate.turn += 1;
        nextStateCandidate.indicators.r = this.scenario.r0;

        // Factor in any new player actions.
        const newContainmentPolicies: ContainmentPolicy[] = this.findNewContainmentPolicies(
            playerActions.containmentPolicies
        );
        for (const containmentPolicy of newContainmentPolicies) {
            nextStateCandidate.indicators = containmentPolicy.immediateEffect(nextStateCandidate);
        }

        // Factor in the recurring effects of existing player actions.
        for (const containmentPolicy of playerActions.containmentPolicies) {
            nextStateCandidate.indicators = containmentPolicy.recurringEffect(nextStateCandidate);
        }

        // Add the new containment policies to the history of player actions
        nextStateCandidate.playerActions.containmentPolicies = playerActions.containmentPolicies;

        // Add any new random events that will trigger on the next turn
        nextStateCandidate.nextInGameEvents = [];

        // Advance world timeline the desired number of days
        let nextIndicators;
        let prevIndicators = this.history[this.history.length - 1];
        for (let i = 0; i < daysToAdvance; i++) {
            nextIndicators = this.computeNextPandemicDay(nextStateCandidate, prevIndicators);
            prevIndicators = nextIndicators;
            // Add the last indicators to the world timeline.
            this.history.push(this.clone(nextIndicators));
        }

        // Update the references to the history slice affected by this entry
        nextStateCandidate.worldHistoryStartIndex =
            this.currentState.worldHistoryStartIndex + this.currentState.historyLength; //The index is inclusive
        nextStateCandidate.historyLength = daysToAdvance;
        nextStateCandidate.indicators = nextIndicators;

        this.turnHistory.push(this.clone(this.currentState));
        this.currentState = nextStateCandidate;

        // Check if victory conditions are met.
        const victoryCondition = this.isVictorious();
        if (victoryCondition) {
            return this.computeVictory(victoryCondition);
        } else {
            return this.clone({
                newInGameEvents: nextStateCandidate.nextInGameEvents,
                latestIndicators: nextIndicators
            });
        }
    }

    private isVictorious(): VictoryCondition | undefined {
        return this.scenario.victoryConditions.find((it) =>
            it.isMet({
                scenario: this.scenario,
                playerActionHistory: this.turnHistory,
                history: this.history
            })
        );
    }

    private computeVictory(victoryCondition: VictoryCondition): VictoryState {
        return {
            simulatorState: this.state(),
            score: this.history[this.history.length - 1].totalCost,
            victoryCondition: victoryCondition
        };
    }

    private computeNextPandemicDay(candidateState: WorldState, lastResult: Indicators): Indicators {
        let actionR = candidateState.indicators.r;
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
        const long_enough = this.history.length >= lag;
        const mortality = this.scenario.mortality;
        const new_deaths_lagging = long_enough ? this.history[this.history.length - lag].numInfected * mortality : 0;

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
            r: candidateState.indicators.r,
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
            turn: 0,
            worldHistoryStartIndex: 0,
            historyLength: 1,
            availablePlayerActions: {
                capabilityImprovements: this.scenario.initialCapabilityImprovements,
                containmentPolicies: this.scenario.initialContainmentPolicies
            },
            indicators: {
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
            numInfected * r * fractionSusceptible + this.history[this.history.length - 1].importedCasesPerDay;
        return expectedNewCases;
    }

    private findNewContainmentPolicies(containmentPoliciesOfTurn: ContainmentPolicy[]): ContainmentPolicy[] {
        const previousPolicies = this.currentState.playerActions.containmentPolicies.map((it) => it.name);
        return containmentPoliciesOfTurn.filter(
            (containmentPolicy) => previousPolicies.indexOf(containmentPolicy.name) == -1
        );
    }

    private findNewCapabilities(capabilityImprovementsInTurn: CapabilityImprovements[]): CapabilityImprovements[] {
        const previousPolicies = this.currentState.playerActions.capabilityImprovements.map((it) => it.name);
        return capabilityImprovementsInTurn.filter(
            (capabilityImprovement) => previousPolicies.indexOf(capabilityImprovement.name) == -1
        );
    }

    private pickRandomEvents(simulatorState: WorldState): InGameEvent[] {
        const eventsThatHappened = simulatorState.playerActions.inGameEventChoices.map((it) => it.inGameEventName);
        return this.scenario.initialInGameEvents.filter((it) => {
            const canOnlyHappenOnceButHasntHappened = it.happensOnce && it.name in eventsThatHappened;
            return (
                it.canActivate(simulatorState) && // Event can appear
                (!it.happensOnce || canOnlyHappenOnceButHasntHappened)
            ); // Event can happen multiple times or it hasn't happened yet
        });
    }

    private clone<T>(obj: T): T {
        return cloneDeep(obj);
    }
}
