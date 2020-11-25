import { Indicators, WorldState } from '../SimulatorState';

/**
 * Represents an in game event.
 */
export interface InGameEvent {
    name: string;
    description: string;
    happensOnce: boolean;
    canActivate: (context: WorldState) => boolean;
    choices: EventChoice[];
}

export interface EventChoice {
    name: string;
    description: string;
    immediateEffect: (context: WorldState) => WorldState;
    recurringEffect: (context: WorldState) => WorldState;
}

export interface RecordedInGameEventChoice {
    inGameEventName: string;
    choice: EventChoice;
}
