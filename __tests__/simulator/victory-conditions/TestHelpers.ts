import { US } from "@src/simulator/scenarios/US";
import { Indicators, SimulatorState, WorldState } from "@src/simulator/SimulatorState";

export class SimulatorStateFactory {
    static empty(): SimulatorState {
        return {
            initialState: US,
            currentState: {
                days: 0,
                indicators: IndicatorFactory.empty(),
                randomEvents: [],
                playerActions: {
                    capabilityImprovements: [],
                    containmentPolicies: [],
                }
            },
            history: []
        }
    }

    static withHistory(numHistoryEntries: number, daysPerTurn = 10): SimulatorState {
        const history = []
        for (let i = 0; i < numHistoryEntries; i++) {

            const entry = WorldStateFactory.empty()
            entry.days = i * daysPerTurn
            history.push(entry)
        }
        return {
            initialState: US,
            currentState: {
                days: numHistoryEntries * daysPerTurn,
                indicators: IndicatorFactory.empty(),
                randomEvents: [],
                playerActions: {
                    capabilityImprovements: [],
                    containmentPolicies: [],
                }
            },
            history: history
        }
    }
}

export class IndicatorFactory {
    static empty(): Indicators {
        return {
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
        }
    }
}

export class WorldStateFactory {
    static empty(): WorldState {
        return {
            days: 0,
            indicators: IndicatorFactory.empty(),
            randomEvents: [],
            playerActions: {
                capabilityImprovements: [],
                containmentPolicies: [],
            }
        }
    }
}