import { InGameEvent } from './in-game-events/InGameEvents';
import { Scenario } from './scenarios/Scenarios';
import { VictoryCondition } from './victory-conditions/VictoryConditon';
import { PlayerContainmentPolicyChoice } from './player-actions/PlayerActions';

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
    containmentPolicies: PlayerContainmentPolicyChoice<any>[];
}

export interface TurnHistoryEntry {
    nextInGameEvents: InGameEvent[];
    playerActions: PlayerActions;
}

export type WorldState = { indicators: Indicators } & TurnHistoryEntry;

export type TimelineEntry = { history: Indicators[] } & TurnHistoryEntry;

export interface SimulatorState {
    scenario: Scenario;
    currentTurn: TurnHistoryEntry;
    timeline: TimelineEntry[];
    history: Indicators[];
}

export interface VictoryState {
    lastTurnIndicators: Indicators[];
    victoryCondition: VictoryCondition;
    score: number;
}

/**
 * Models the updated state of the world at the start of a new turn
 */
export interface NextTurnState {
    latestIndicators: Indicators;
    lastTurnIndicators: Indicators[];
    newInGameEvents: InGameEvent[];
}

/**
 * Models the state where the game ends due to a victory condition being met
 */

export const isNextTurn = (nextTurn: NextTurnState | VictoryState): nextTurn is NextTurnState => {
    return (nextTurn as any)?.newInGameEvents !== undefined;
};
