import { HospitalCapacityExceeded } from '../in-game-events/HospitalCapacityExceeded';
import { WelcomeEvent } from '../in-game-events/WelcomeEvent';
import { CloseBusinesses } from '../player-actions/CloseBusinesses';
import { CloseSchools } from '../player-actions/CloseSchools';
import { CloseTransit } from '../player-actions/CloseTransit';
import { RequireMasks } from '../player-actions/RequireMasks';
import { TimeVictory } from '../victory-conditions/TimeVictory';
import { Scenario } from './Scenarios';

export const GDP_US = 2e13; // 20 trillion dollars: annual US GDP
export const US: Scenario = {
    totalPopulation: 400000000, // 400 million people -- i.e. approximate US population
    initialNumInfected: 10000, // 100,000 people infected -- we're in the middle of a pandemic!
    r0: 1.09, // infections double every 10 days
    importedCasesPerDay: 0.1,
    hospitalCapacity: 1000000, // 1 million hospital beds -- https://www.aha.org/statistics/fast-facts-us-hospitals
    gdpPerDay: GDP_US / 365.0,
    power: 1,
    distr_family: 'nbinom',
    dynamics: 'SIS',
    mortality: 0.01,
    time_lumping: false,
    initialContainmentPolicies: [CloseBusinesses, CloseSchools, CloseTransit, RequireMasks],
    initialCapabilityImprovements: [],
    availableInGameEvents: [HospitalCapacityExceeded],
    victoryConditions: [TimeVictory],
    symptom_rate: 0.1
};
