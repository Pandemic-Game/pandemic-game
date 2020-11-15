import { Indicators } from "./SimulatorState";

/**
 * Represents a random event
 */
export interface RandomEvent {
    name: string
    probability: number // Double between 0 and 1
    minDaysBeforeAppear: number // minimum number of simulation days before this event can appear
    immediateEffect: (worldState: Indicators) => Indicators
    recurringEffect: (worldState: Indicators) => Indicators
}