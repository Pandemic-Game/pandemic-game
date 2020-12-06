import { SimulatorState } from '../SimulatorState';

/**
 * Represents an in game event.
 */
export interface InGameEvent {
    name: string;
    description: string;
    happensOnce: boolean;
    cssClass: string;
    canActivate: (context: SimulatorState) => boolean;
    choices: EventChoice[];
}

export interface EventChoice {
    name: string;
    description: string;
    immediateEffect: (context: SimulatorState) => SimulatorState;
    recurringEffect: (context: SimulatorState) => SimulatorState;
}

export interface RecordedInGameEventChoice {
    inGameEventName: string;
    choice: EventChoice;
}
