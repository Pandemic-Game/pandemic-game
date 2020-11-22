import { SimulatorState } from "../src/lib/SimulatorState"
import { TimeVictory } from "../src/lib/VictoryConditon"
import { SimulatorStateFactory } from "./TestHelpers"

describe("A time victory condition", () => {

    it("Returns false before 365 days have elapsed", () => {
        const simulatorState: SimulatorState = SimulatorStateFactory.empty()
        expect(TimeVictory.isMet(simulatorState)).toBe(false)
    })

    it("Returns true after 365 days have elapsed", () => {
        const simulatorState: SimulatorState = SimulatorStateFactory.empty()
        simulatorState.currentState.days = 366
        expect(TimeVictory.isMet(simulatorState)).toBe(true)
    })
})