import { US } from "@src/simulator/scenarios/US";
import { Indicators, SimulatorState, WorldState } from "@src/simulator/SimulatorState";

export class SimulatorStateFactory {
    static empty(): SimulatorState {
        return {
            scenario: US,
            currentState: {
                turn: 0,
                worldHistoryEndIndex: 0,
                worldHistoryStartIndex: 0,
                indicators: IndicatorFactory.empty(),
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
            },
            history: []
        }
    }

    static withHistory(numHistoryEntries: number, daysPerTurn = 10): SimulatorState {
        const history = []
        for (let i = 0; i < numHistoryEntries; i++) {
            const entry = IndicatorFactory.empty()
            entry.days = i
            history.push(entry)
        }
        return {
            scenario: US,
            currentState: {
                turn: (numHistoryEntries > daysPerTurn) ? Math.ceil(numHistoryEntries / daysPerTurn) : 1,
                worldHistoryEndIndex: 0,
                worldHistoryStartIndex: 0,
                indicators: IndicatorFactory.empty(),
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
            },
            history: history
        }
    }
}

export class IndicatorFactory {
    static empty(): Indicators {
        return {
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
        }
    }
}

export class WorldStateFactory {
    static empty(): WorldState {
        return {
            turn: 0,
            worldHistoryEndIndex: 0,
            worldHistoryStartIndex: 0,
            indicators: IndicatorFactory.empty(),
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