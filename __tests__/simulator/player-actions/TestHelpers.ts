import { US } from "@src/simulator/scenarios/US";
import { WorldState } from "@src/simulator/SimulatorState";

export class WorldStateFactory {
    static empty(): WorldState {
        return {
            indicators: {
                days: 0,
                totalPopulation: US.totalPopulation,
                numInfected: 0,
                numDead: 0,
                importedCasesPerDay: 0,
                r: US.r0,
                hospitalCapacity: US.hospitalCapacity,
                medicalCosts: 0,
                economicCosts: 0,
                deathCosts: 0,
                totalCost: 0
            },
            availablePlayerActions: {
                capabilityImprovements: [],
                containmentPolicies: [],
            },
            nextInGameEvents: [],
            playerActions: {
                capabilityImprovements: [],
                containmentPolicies: [],
                inGameEventChoices: []
            }
        }
    }
}