import { US } from "../src/lib/Scenarios";
import { SimulatorState } from "../src/lib/SimulatorState";

export class SimulatorStateFactory {
    static empty(): SimulatorState {
        return {
            initialState: US,
            currentState: {
                days: 0,
                indicators: {
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
                randomEvents: [],
                playerActions: {
                    capabilityImprovements: [],
                    containmentPolicies: [],
                }
            },
            history: []
        }
    }
}