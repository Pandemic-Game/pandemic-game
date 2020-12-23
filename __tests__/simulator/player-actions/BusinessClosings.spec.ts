import { WorldState } from "@src/simulator/SimulatorState";
import { WorldStateFactory } from "./TestHelpers";
import cloneDeep from 'lodash/cloneDeep';
import { BusinessClosings, BusinessClosingsOpts } from "@src/simulator/player-actions/PlayerActions2";


describe("The behaviour and effect of the business closings order", () => {

    const testContext: WorldState = WorldStateFactory.empty();

    (['None', 'Some', 'Most'] as BusinessClosingsOpts[]).forEach(opt => {
        it("Has no extra effect when it becomes active", () => {
            const initialState = cloneDeep(testContext);
            const updatedState = BusinessClosings.immediateEffect(initialState, opt)
            expect(updatedState).toEqual(initialState.indicators);
        })
    })

    it("Reduces the value of R by 17.5% when some businesses are closed", () => {
        const initialState = cloneDeep(testContext);
        const updatedState = BusinessClosings.recurringEffect(initialState, 'Some')
        expect(updatedState.r.toFixed(4)).toEqual((initialState.indicators.r * (1 - 0.175)).toFixed(4))
    })

    it("Reduces the value of R by 26.4% when most businesses are closed", () => {
        const initialState = cloneDeep(testContext);
        const updatedState = BusinessClosings.recurringEffect(initialState, 'Most')
        expect(updatedState.r.toFixed(4)).toEqual((initialState.indicators.r * (1 - 0.264)).toFixed(4))
    })


    it("Does not affect the value of R when no businesses are closed", () => {
        const initialState = cloneDeep(testContext);
        const updatedState = BusinessClosings.immediateEffect(initialState, 'None')
        expect(updatedState).toEqual(initialState.indicators);
    })

})