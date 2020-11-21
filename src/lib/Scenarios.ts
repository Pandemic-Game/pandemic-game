import { RandomEvent } from "./RandomEvents";
import { VictoryCondition } from "./VictoryConditon";
/**
 * Represents the initial state of the game world.
 */
export interface Scenario {
    totalPopulation: number
    initialNumInfected: number
    importedCasesPerDay: number
    r0: number
    hospitalCapacity: number
    gdpPerDay: number
    power: number
    distr_family: string
    dynamics: string
    mortality: number // A number between 0 and 1 representing the mortality
    time_lumping: boolean,
    randomEvents: RandomEvent[]
    victoryConditions: VictoryCondition[]
}


const GDP_US = 2e13; // 20 trillion dollars: annual US GDP
export const US: Scenario = {
    totalPopulation: 400000000, // 400 million people -- i.e. approximate US population
    initialNumInfected: 10000, // 100,000 people infected -- we're in the middle of a pandemic!
    r0: 1.08, // infections double every 10 days
    importedCasesPerDay: 0.1,
    hospitalCapacity: 1000000, // 1 million hospital beds -- https://www.aha.org/statistics/fast-facts-us-hospitals
    gdpPerDay: GDP_US / 365.0,
    power: 1,
    distr_family: 'nbinom',
    dynamics: 'SIS',
    mortality: 0.01,
    time_lumping: false,
    randomEvents: [],
    victoryConditions: []
} 