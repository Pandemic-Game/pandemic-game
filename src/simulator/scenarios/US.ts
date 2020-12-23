import { HospitalCapacityExceeded } from '../in-game-events/HospitalCapacityExceeded';
import {
    BusinessClosings,
    GatheringSize,
    SchoolsAndUniveristyClosures,
    StayAtHomeOrder
} from '../player-actions/PlayerActions2';
import { TimeVictory } from '../victory-conditions/TimeVictory';
import { Scenario } from './Scenarios';
import { usHistory } from './US_runup';

export const GDP_US = 2e13; // 20 trillion dollars: annual US GDP

export const US: Scenario = {
    totalPopulation: 400000000, // 400 million people -- i.e. approximate US population
    initialNumInfected: usHistory[usHistory.length - 1].numInfected, // 100,000 people infected -- we're in the middle of a pandemic!
    initialMedicalCosts: usHistory[usHistory.length - 1].medicalCosts,
    initialEconomicCosts: usHistory[usHistory.length - 1].economicCosts,
    initialDeathCosts: usHistory[usHistory.length - 1].deathCosts,
    r0: 1.09, // infections double every 10 days
    importedCasesPerDay: 0.1,
    hospitalCapacity: 1000000, // 1 million hospital beds -- https://www.aha.org/statistics/fast-facts-us-hospitals
    runUpPeriod: usHistory,
    gdpPerDay: GDP_US / 365.0,
    power: 1,
    distr_family: 'nbinom',
    dynamics: 'SIS',
    mortality: 0.01,
    time_lumping: false,
    initialContainmentPolicies: [StayAtHomeOrder, GatheringSize, BusinessClosings, SchoolsAndUniveristyClosures],
    initialCapabilityImprovements: [],
    availableInGameEvents: [HospitalCapacityExceeded],
    victoryConditions: [TimeVictory]
};
