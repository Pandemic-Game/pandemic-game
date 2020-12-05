import { CapabilityImprovements, ContainmentPolicy } from './player-actions/PlayerActions';
import { InGameEvent, RecordedInGameEventChoice } from './in-game-events/InGameEvents';
import { Scenario } from './scenarios/Scenarios';
import { VictoryCondition } from './victory-conditions/VictoryConditon';

/**
 * Represents the state of the simulation on a given turn.
 */
export interface Indicators {
    days: number;
    totalPopulation: number;
    numInfected: number;
    numDead: number;
    importedCasesPerDay: number;
    r: number;
    hospitalCapacity: number;
    medicalCosts: number;
    economicCosts: number;
    deathCosts: number;
    totalCost: number;
}

/**
 * Represents the set of player actions in effect at a given point in time
 */
export interface PlayerActions {
    containmentPolicies: ContainmentPolicy[];
    capabilityImprovements: CapabilityImprovements[];
    inGameEventChoices: RecordedInGameEventChoice[];
}

/**
 * Represents the history of game turns. Since the history of the game world is computed on a per-day
 * basis the turn history may encompass more than one entry in the game world history.
 */
export interface TurnHistoryEntry {
    turn: number;
    worldHistoryStartIndex: number;
    worldHistoryEndIndex: number;
    availablePlayerActions: {
        containmentPolicies: ContainmentPolicy[];
        capabilityImprovements: CapabilityImprovements[];
    };
    nextInGameEvents: InGameEvent[];
    playerActions: PlayerActions;
}

/**
 * Full simulator state
 */
export interface SimulatorState {
    scenario: Scenario;
    playerActionHistory: TurnHistoryEntry[];
    history: Indicators[];
}

/**
 * Models the updated state of the world at the start of a new turn
 */
export interface NextTurnState {
    latestIndicators: Indicators;
    newInGameEvents: InGameEvent[];
}

/**
 * Models the state where the game ends due to a victory condition being met
 */
export interface VictoryState {
    simulatorState: SimulatorState;
    victoryCondition: VictoryCondition;
    score: number;
}

export const isNextTurn = (nextTurn: NextTurnState | VictoryState): nextTurn is NextTurnState => {
    return (nextTurn as any)?.latestIndicators !== undefined;
};
