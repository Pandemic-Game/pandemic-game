import { US } from "@src/simulator/scenarios/US";
import { Indicators, SimulatorState, TurnHistoryEntry } from "@src/simulator/SimulatorState";

export class SimulatorStateFactory {
    static empty(): SimulatorState {
        return {
            scenario: US,
            playerActionHistory: [],
            history: []
        }
    }

    static withHistory(numHistoryEntries: number): SimulatorState {
        const history = []
        const playerActionHistory: TurnHistoryEntry[] = []
        for (let i = 0; i < numHistoryEntries; i++) {
            const entry = IndicatorFactory.empty()
            const playerAction = TurnHistoryEntryFactory.empty()
            playerActionHistory.push(playerAction);

            entry.days = i
            history.push(entry)
        }
        return {
            scenario: US,
            playerActionHistory: playerActionHistory,
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

export class TurnHistoryEntryFactory {
    static empty(): TurnHistoryEntry {
        return {
            turn: 0,
            historyLength: 0,
            worldHistoryStartIndex: 0,
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