import { InGameEvent } from '../in-game-events/InGameEvents';
import { CapabilityImprovements } from '../player-actions/PlayerActions';
import { ContainmentPolicy2 } from '../player-actions/PlayerActions2';
import { Indicators } from '../SimulatorState';
import { VictoryCondition } from '../victory-conditions/VictoryConditon';
/**
 * Represents the initial state of the game world.
 */
export interface Scenario {
    totalPopulation: number;
    initialNumInfected: number;
    initialMedicalCosts: number;
    initialEconomicCosts: number;
    initialDeathCosts: number;
    importedCasesPerDay: number;
    r0: number;
    runUpPeriod: Indicators[];
    hospitalCapacity: number;
    gdpPerDay: number;
    power: number;
    distr_family: string;
    dynamics: string;
    mortality: number; // A number between 0 and 1 representing the mortality
    time_lumping: boolean;
    initialContainmentPolicies: ContainmentPolicy2<any>[];
    initialCapabilityImprovements: CapabilityImprovements[];
    availableInGameEvents: InGameEvent[];
    victoryConditions: VictoryCondition[];
}
