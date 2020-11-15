import { CapabilityImprovements, ContainmentDoctrine, ContainmentPolicy } from "./PlayerActions";
import { RandomEvent } from "./RandomEvents";

/**
 * Represents the initial state of the game world.
 */
export interface GameWorld {
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
    wellbeing: number
}

/**
 * Represents the set of player actions in effect at a given point in time
 */
export interface PlayerAction {
    doctrine: ContainmentDoctrine
    containmentPolicies: ContainmentPolicy[]
    capabilityImprovements: CapabilityImprovements[]
}

/**
 * Snapshot of the full world state for a given point in time
 */
export interface WorldState {
    days: number
    indicators: Indicators
    randomEvents: RandomEvent[]
    playerActions: PlayerAction[]
}

/**
 * Full simulator state
 */
export interface SimulatorState {
    initialState: GameWorld
    currentState: WorldState
    history: WorldState[]
}