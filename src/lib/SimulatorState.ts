import { CapabilityImprovements, ContainmentPolicy } from "./PlayerActions";
import { RandomEvent } from "./RandomEvents";
import { Scenario } from "./Scenarios";
import { VictoryCondition } from "./VictoryConditon";

/**
 * Represents the state of the simulation on a given turn.
 */
export interface Indicators {
    totalPopulation: number
    numInfected: number
    numDead: number
    importedCasesPerDay: number
    r: number
    hospitalCapacity: number
    medicalCosts: number
    economicCosts: number
    deathCosts: number
    totalCost: number
}

/**
 * Represents the set of player actions in effect at a given point in time
 */
export interface PlayerActions {
    containmentPolicies: ContainmentPolicy[]
    capabilityImprovements: CapabilityImprovements[]
}

/**
 * Snapshot of the full world state for a given point in time. Includes the set of indicators that are tracked
 * plus any random events that happened so far, and the set of player actions in force at that point in time.
 */
export interface WorldState {
    days: number
    indicators: Indicators
    randomEvents: RandomEvent[]
    playerActions: PlayerActions
}

/**
 * Full simulator state
 */
export interface SimulatorState {
    initialState: Scenario
    currentState: WorldState
    history: WorldState[]
}

/**
 * Models the updated state of the world at the start of a new turn 
 */
export interface NexTurnState {
    currentState: WorldState,
    newRandomEvents: RandomEvent[]
}

/**
 * Models the state where the game ends due to a victory condition being met
 */
export interface VictoryState {
    simulatorState: SimulatorState,
    victoryCondition: VictoryCondition,
    score: number
}