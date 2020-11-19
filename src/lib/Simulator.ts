import { CapabilityImprovements, ContainmentPolicy } from "./PlayerActions"
import { RandomEvent } from "./RandomEvents"
import { NexTurnState, PlayerActions, SimulatorState, WorldSetup, WorldState } from "./SimulatorState"
import { FakeNegativeBinomial } from "./Probabilities"

class Simulator {

    private initialState: WorldSetup
    private scaleFactor: number
    private daysPerTurn: number
    private currentState: WorldState
    private history: WorldState[]

    constructor(initialState: WorldSetup) {
        this.initialState = initialState
        this.daysPerTurn = 10
        this.scaleFactor = initialState.gdpPerDay * 0.2
        this.currentState = this.computeInitialWorldState()
    }

    //TODO: add guards to guarantee that player actions and capability improvements match the expectations.
    nextTurn(actionsInTurn: PlayerActions): NexTurnState {
        // Start by figuring out the baseline world state for the next turn
        const nextSimulatorState = this.getCurrentState()
        nextSimulatorState.currentState = this.computeNextWorldState()

        // Factor in any new player actions and random events.
        const newPlayerActions: ContainmentPolicy[] = this.findNewContainmentPolicies(actionsInTurn.containmentPolicies)
        for (const containmentPolicy of newPlayerActions) {
            nextSimulatorState.currentState.indicators = containmentPolicy.immediateEffect(nextSimulatorState)
        }

        const newCapabilities: CapabilityImprovements[] = this.findNewCapabilities(actionsInTurn.capabilityImprovements)
        for (const capability of newCapabilities) {
            actionsInTurn
            nextSimulatorState.currentState.indicators = capability.immediateEffect(nextSimulatorState)
        }

        const newRandomEvents: RandomEvent[] = this.pickRandomEvent(nextSimulatorState)
        for (const randomEvent of newRandomEvents) {
            nextSimulatorState.currentState.indicators = randomEvent.immediateEffect(nextSimulatorState)
        }

        // Update the actions and random events.
        nextSimulatorState.currentState.playerActions = actionsInTurn
        nextSimulatorState.currentState.randomEvents = nextSimulatorState.currentState.randomEvents.concat(newRandomEvents)

        // store the old previous state in the history
        this.history.push(this.currentState)
        this.currentState = nextSimulatorState.currentState

        return this.clone({
            newRandomEvents: newRandomEvents,
            currentState: this.currentState
        });
    }

    getCurrentState(): SimulatorState {
        const simulatorStateSnapshot: SimulatorState = {
            initialState: this.initialState,
            currentState: this.currentState,
            history: this.history
        }
        // Return an immutable copy of the state.
        return this.clone(simulatorStateSnapshot)
    }

    private computeNextWorldState(r: number): WorldState {
        let action_r = r ** this.daysPerTurn // compounding effect of a repeated action
        const last_result = this.currentState
        const prev_cases = last_result.indicators.numInfected

        // Don't allow cases to exceed hospital capacity
        const hospitalCapacity = this.currentState.indicators.hospitalCapacity
        const lockdown_ratio = hospitalCapacity / prev_cases;
        const capped_action_r = prev_cases * action_r >= hospitalCapacity ? lockdown_ratio : action_r;
        action_r = capped_action_r;

        // Compute next state
        let new_num_infected = this._new_random_state(prev_cases, action_r);
        new_num_infected = Math.max(Math.floor(new_num_infected), 0);
        new_num_infected = Math.min(new_num_infected, this.initialState.totalPopulation);
        // Deaths from infections started 20 days ago

        const lag = Math.floor(20 / this.daysPerTurn); // how many steps, of `days` length each, need to have passed?
        const long_enough = this.history.length > lag;
        const mortality = this.initialState.mortality
        const new_deaths_lagging = long_enough ? this.history[this.history.length - lag].indicators.numInfected * mortality : 0;

        const currentDay = last_result.days + this.daysPerTurn
        return {
            days: currentDay,
            indicators: {
                days: currentDay,
                numDead: new_deaths_lagging,
                numInfected: new_num_infected,
                totalPopulation: this.initialState.totalPopulation,
                hospitalCapacity: this.initialState.hospitalCapacity,
                r: this.initialState.r0,
                importedCases: this.initialState.importedCasesPerDay,
                deathCosts: this.computeDeathCost(new_deaths_lagging),
                economicCosts: this.computeEconomicCosts(action_r, currentDay),
                medicalCosts: this.computeHospitalizationCosts(new_num_infected),
                totalCost: this.computeTotalCosts(new_num_infected, new_deaths_lagging, action_r, currentDay)
            },
            playerActions: {
                capabilityImprovements: [],
                containmentPolicies: []
            },
            randomEvents: []
        }
    }

    private computeInitialWorldState(): WorldState {
        return {
            days: 0,
            indicators: {
                days: 0,
                numDead: 0,
                numInfected: this.initialState.initialNumInfected,
                totalPopulation: this.initialState.totalPopulation,
                hospitalCapacity: this.initialState.hospitalCapacity,
                r: this.initialState.r0,
                importedCases: this.initialState.importedCasesPerDay,
                deathCosts: this.computeDeathCost(0),
                economicCosts: this.computeEconomicCosts(this.initialState.r0, 0),
                medicalCosts: this.computeHospitalizationCosts(this.initialState.initialNumInfected),
                totalCost: this.computeTotalCosts(this.initialState.initialNumInfected, 0, this.initialState.r0, 0)
            },
            playerActions: {
                capabilityImprovements: [],
                containmentPolicies: []
            },
            randomEvents: []
        }
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

    private computeEconomicCosts(r: number, days: number): number {
        if (r >= this.initialState.r0) {
            return 0;
        }
        return ((this.scaleFactor * (this.initialState.r0 ** 10 - r ** 10)) / this.initialState.r0 ** 10) * days;
    }

    private computeTotalCosts(numInfected: number, numDead: number, r: number, days: number): number {
        return this.computeHospitalizationCosts(numInfected) +
            this.computeEconomicCosts(r, days) +
            this.computeDeathCost(numDead)
    }

    private _new_random_state(num_infected: number, action_r: number) {
        const lam = this._expected_new_state(num_infected, action_r);
        const r = 50.0;
        const p = lam / (r + lam);
        const new_num_infected = new FakeNegativeBinomial(r, p).sample();
        return new_num_infected;
    }

    private _expected_new_state(num_infected: number, r: number) {
        const fraction_susceptible = 1; // immune population?
        const expected_new_cases = num_infected * r * fraction_susceptible + this.currentState.indicators.importedCases;
        return expected_new_cases;
    }

    private clone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj))
    }
}