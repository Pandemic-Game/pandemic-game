import { CapabilityImprovements, ContainmentPolicy } from "./PlayerActions";
import { RandomEvent } from "./RandomEvents";

/**
 * Represents the initial state of the game world.
 */
export interface WorldSetup {
    totalPopulation: number
    wellbeing: number
    initialNumInfected: number
    importedCasesPerDay: number
    r0: number
    hospitalCapacity: number
    gdpPerDay: number
    power: number
    distr_family: string
    dynamics: string
    mortality: number //0.01
    time_lumping: boolean
}

/**
 * Represents the state of the simulation on a given turn.
 */
export interface Indicators {
    days: number  // Number of days since the start of the simulation
    totalPopulation: number
    numInfected: number
    numDead: number
    importedCases: number
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
    initialState: WorldSetup
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