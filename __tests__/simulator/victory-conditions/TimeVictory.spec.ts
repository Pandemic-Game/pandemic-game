import { SimulatorState } from "@src/simulator/SimulatorState"
import { TimeVictory } from "@src/simulator/victory-conditions/TimeVictory"
import { SimulatorStateFactory } from "./TestHelpers"

describe("A time victory condition", () => {

    it("Returns false before 365 days have elapsed - emtpy history", () => {
        const simulatorState: SimulatorState = SimulatorStateFactory.empty()
        expect(TimeVictory.isMet(simulatorState)).toBe(false)
    })

    it("Returns false before 365 days have elapsed - some history", () => {
        const simulatorState: SimulatorState = SimulatorStateFactory.withHistory(234, 1)
        expect(TimeVictory.isMet(simulatorState)).toBe(false)
    })

    it("Returns true after 365 days have elapsed", () => {
        const simulatorState: SimulatorState = SimulatorStateFactory.withHistory(366, 1)
        expect(TimeVictory.isMet(simulatorState)).toBe(true)
    })
})