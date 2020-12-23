import { US } from "@src/simulator/scenarios/US";
import { Indicators, SimulatorState, TimelineEntry, TurnHistoryEntry } from "@src/simulator/SimulatorState";

export class SimulatorStateFactory {
    static empty(): SimulatorState {
        return {
            scenario: US,
            currentTurn: TurnHistoryEntryFactory.empty(),
            timeline: [],
            history: []
        }
    }

    static withHistory(numHistoryEntries: number): SimulatorState {
        const history = []
        const timeline: TimelineEntry[] = []
        for (let i = 0; i < numHistoryEntries; i++) {
            const entry = IndicatorFactory.empty()
            entry.days = i
            history.push(entry)
            const playerAction = TurnHistoryEntryFactory.empty()
            timeline.push({ ...playerAction, history: [entry] });
        }
        return {
            scenario: US,
            currentTurn: TurnHistoryEntryFactory.empty(),
            timeline: timeline,
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
            nextInGameEvents: [],
            playerActions: {
                containmentPolicies: [],
            }
        }
    }
}