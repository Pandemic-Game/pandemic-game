import { RandomEvent } from '../random-events/RandomEvents';
import { VictoryCondition } from '../victory-conditions/VictoryConditon';
/**
 * Represents the initial state of the game world.
 */
export interface Scenario {
    totalPopulation: number;
    initialNumInfected: number;
    importedCasesPerDay: number;
    r0: number;
    hospitalCapacity: number;
    gdpPerDay: number;
    power: number;
    distr_family: string;
    dynamics: string;
    mortality: number; // A number between 0 and 1 representing the mortality
    time_lumping: boolean;
    randomEvents: RandomEvent[];
    victoryConditions: VictoryCondition[];
}
