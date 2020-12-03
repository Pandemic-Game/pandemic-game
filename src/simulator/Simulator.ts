import { CapabilityImprovements, ContainmentPolicy } from './player-actions/PlayerActions';
import { InGameEvent } from './in-game-events/InGameEvents';
import { NextTurnState, PlayerActions, SimulatorState, VictoryState, WorldState } from './SimulatorState';
import { FakeNegativeBinomial } from '../lib/Probabilities';
import { Scenario } from './scenarios/Scenarios';
import { VictoryCondition } from './victory-conditions/VictoryConditon';
import cloneDeep from 'lodash/cloneDeep';

export class Simulator {
    private scenario: Scenario;
    private scaleFactor: number;
    private daysPerTurn: number;
    private currentState: WorldState;
    private history: WorldState[];

    constructor(scenario: Scenario, daysPerTurn = 10) {
        this.scenario = scenario;
        this.daysPerTurn = daysPerTurn;
        this.scaleFactor = scenario.gdpPerDay * 0.2;
        this.currentState = this.computeInitialWorldState();
        this.history = [];
    }

    /**
     * Restarts the scenario at a given turn (turn zero by default).
     * Returns a new simulator instance.
     */
    reset(turn: number = 0): Simulator {
        const newSimulator = new Simulator(this.scenario, this.daysPerTurn);
        if (turn > 0 && this.history.length > 1) {
            const maxTurn = Math.min(turn, this.history.length - 1);
            newSimulator.history = this.history.slice(0, maxTurn);
            newSimulator.currentState = newSimulator.history.pop();
        }
        return newSimulator;
    }

    /**
     * Allows the caller to obtain a snapshot of the current simulator state.
     */
    state(): SimulatorState {
        const simulatorStateSnapshot: SimulatorState = {
            scenario: this.scenario,
            currentState: this.currentState,
            history: this.history
        };
        // Return an immutable copy of the state.
        return this.clone(simulatorStateSnapshot);
    }

    /**
     * Processes the next turn by computing the effects of player actions, random events and the natural
     * progression of the epidemic.
     */
    nextTurn(actionsInTurn: PlayerActions): NextTurnState | VictoryState {
        const nextTurn = this.prepareNextTurn(actionsInTurn);
        const victoryCondition = this.isVictorious();
        if (victoryCondition) {
            return this.computeVictory(victoryCondition);
        } else {
            return nextTurn;
        }
    }

    private prepareNextTurn(playerActions: PlayerActions): NextTurnState {
        // TODO: add guards to guarantee that player actions and capability improvements match the allowed set.

        // Create a new copy of the current state to avoid side effects that can pollute the history
        let nextStateCandidate = this.clone(this.currentState);
        this.history.push(this.clone(this.currentState));

        // Reset R
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
            console.log(`${containmentPolicy.name} -> R: ${nextStateCandidate.indicators.r}`);
        }

        // Add the new containment policies to the history of player actions
        nextStateCandidate.playerActions.containmentPolicies = playerActions.containmentPolicies;

        // Add any new random events that will trigger on the next turn
        nextStateCandidate.nextInGameEvents = [];

        // Save the candidate state as the new current state
        this.currentState = this.computeNaturalPandemicEvolution(nextStateCandidate);

        return this.clone({
            newInGameEvents: nextStateCandidate.nextInGameEvents,
            currentState: this.currentState
        });
    }

    private isVictorious(): VictoryCondition | undefined {
        const simulatorState = this.state();
        return this.scenario.victoryConditions.find((it) => it.isMet(simulatorState));
    }

    private computeVictory(victoryCondition: VictoryCondition): VictoryState {
        return {
            simulatorState: this.state(),
            score: this.currentState.indicators.totalCost,
            victoryCondition: victoryCondition
        };
    }

    private computeNaturalPandemicEvolution(candidateState: WorldState): WorldState {
        let action_r = candidateState.indicators.r ** this.daysPerTurn; // compounding effect of a repeated action
        const last_result = this.currentState;
        const prev_cases = last_result.indicators.numInfected;

        // Don't allow cases to exceed hospital capacity
        const hospitalCapacity = this.currentState.indicators.hospitalCapacity;
        const lockdown_ratio = hospitalCapacity / prev_cases;
        const capped_action_r = prev_cases * action_r >= hospitalCapacity ? lockdown_ratio : action_r;
        action_r = capped_action_r;

        // Compute next state
        let new_num_infected = this.generateNewCasesFromDistribution(prev_cases, action_r);
        new_num_infected = Math.max(Math.floor(new_num_infected), 0);
        new_num_infected = Math.min(new_num_infected, this.scenario.totalPopulation);
        // Deaths from infections started 20 days ago

        const lag = Math.floor(20 / this.daysPerTurn); // how many steps, of `days` length each, need to have passed?
        const long_enough = this.history.length >= lag;
        const mortality = this.scenario.mortality;
        const new_deaths_lagging = long_enough
            ? this.history[this.history.length - lag].indicators.numInfected * mortality
            : 0;

        const currentDay = last_result.days + this.daysPerTurn;
        const deathCosts = this.computeDeathCost(new_deaths_lagging);
        const economicCosts = this.computeEconomicCosts(action_r);
        const medicalCosts = this.computeHospitalizationCosts(new_num_infected);
        return {
            days: currentDay,
            availablePlayerActions: candidateState.availablePlayerActions,
            indicators: {
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
            },
            playerActions: candidateState.playerActions,
            nextInGameEvents: []
        };
    }

    private computeInitialWorldState(): WorldState {
        // TODO: The hospitalization costs will not be zero on the first turn!
        const deathCosts = this.computeDeathCost(0);
        const economicCosts = this.computeEconomicCosts(this.scenario.r0);
        const medicalCosts = this.computeHospitalizationCosts(this.scenario.initialNumInfected);

        return {
            days: 0,
            availablePlayerActions: {
                capabilityImprovements: this.scenario.initialCapabilityImprovements,
                containmentPolicies: this.scenario.initialContainmentPolicies
            },
            indicators: {
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
        console.log(`R: ${r}`);
        debugger;
        if (r >= this.scenario.r0) {
            return 0;
        }

        debugger;
        return ((this.scaleFactor * (this.scenario.r0 ** 10 - r ** 10)) / this.scenario.r0 ** 10) * this.daysPerTurn;
    }

    private generateNewCasesFromDistribution(num_infected: number, action_r: number) {
        const lam = this.generateNewCases(num_infected, action_r);
        const r = 50.0;
        const p = lam / (r + lam);
        const new_num_infected = new FakeNegativeBinomial(r, p).sample();
        return new_num_infected;
    }

    private generateNewCases(num_infected: number, r: number) {
        const fraction_susceptible = 1; // immune population?
        const expected_new_cases =
            num_infected * r * fraction_susceptible + this.currentState.indicators.importedCasesPerDay;
        return expected_new_cases;
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
