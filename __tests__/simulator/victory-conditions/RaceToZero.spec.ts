import { SimulatorState } from "@src/simulator/SimulatorState"
import { RaceToZero } from "@src/simulator/victory-conditions/RaceToZero"
import { SimulatorStateFactory } from "./TestHelpers"

describe("A race to zero victory condition", () => {

    for (let i = 0; i < 30; i++) {
        it(`Returns false the game time is less than 30 days - day ${i}`, () => {
            const simulatorState: SimulatorState = SimulatorStateFactory.empty()
            simulatorState.currentState.days = i
            expect(RaceToZero.isMet(simulatorState)).toBe(false)
        })
    }

    it("Returns false if there are infected in the last 30 days - infected in the current state", () => {
        const simulatorState: SimulatorState = SimulatorStateFactory.empty()
        simulatorState.currentState.days = 233
        simulatorState.currentState.indicators.numInfected = 12
        expect(RaceToZero.isMet(simulatorState)).toBe(false)
    })

    it("Returns false if there are infected in the last 30 days - infected in the last 30 day history", () => {
        const simulatorState: SimulatorState = SimulatorStateFactory.withHistory(10)
        const lastHistoryEntry = simulatorState.history[simulatorState.history.length - 1]
        lastHistoryEntry.indicators.numInfected = 121
        expect(RaceToZero.isMet(simulatorState)).toBe(false)
    })

    it("Returns true if there are no infected in the last 30 days", () => {
        const simulatorState: SimulatorState = SimulatorStateFactory.withHistory(10)
        // simulate a number of infected before the last 30 days
        const cutOff = simulatorState.currentState.days - 30
        simulatorState.history.forEach(it => {
            if (it.days < cutOff) {
                it.indicators.numInfected = 1 + Math.ceil(Math.random() * 100)
            }
        })
        expect(RaceToZero.isMet(simulatorState)).toBe(true)
    })
})