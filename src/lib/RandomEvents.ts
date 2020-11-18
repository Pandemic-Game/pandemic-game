import { Indicators, SimulatorState } from "./SimulatorState";

/**
 * Represents a random event
 */
export interface RandomEvent {
    name: string
    probability: number // Double between 0 and 1
    minDaysBeforeAppear: number // minimum number of simulation days before this event can appear
    immediateEffect: (context: SimulatorState) => Indicators
    recurringEffect: (context: SimulatorState) => Indicators
}