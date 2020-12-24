import { WorldState } from "@src/simulator/SimulatorState";
import { WorldStateFactory } from "./TestHelpers";
import cloneDeep from 'lodash/cloneDeep';
import { GatheringSize, GatheringSizeOpts } from "@src/simulator/player-actions/PlayerActions";


describe("The behaviour and effect of the gathering size order", () => {

    const testContext: WorldState = WorldStateFactory.empty();

    ([10, 100, 1000, 'Infinity'] as GatheringSizeOpts[]).forEach(opt => {
        it("Has no extra effect when it becomes active", () => {
            const initialState = cloneDeep(testContext);
            const updatedState = GatheringSize.immediateEffect(initialState, opt)
            expect(updatedState).toEqual(initialState.indicators);
        })
    })

    it("Reduces the value of R by 22.7% when gathering size 1000", () => {
        const initialState = cloneDeep(testContext);
        const updatedState = GatheringSize.recurringEffect(initialState, 1000)
        expect(updatedState.r.toFixed(4)).toEqual((initialState.indicators.r * (1 - 0.227)).toFixed(4))
    })

    it("Reduces the value of R by 34.3% when gathering size 100", () => {
        const initialState = cloneDeep(testContext);
        const updatedState = GatheringSize.recurringEffect(initialState, 100)
        expect(updatedState.r.toFixed(4)).toEqual((initialState.indicators.r * (1 - 0.343)).toFixed(4))
    })

    it("Reduces the value of R by 41.9% when gathering size 10", () => {
        const initialState = cloneDeep(testContext);
        const updatedState = GatheringSize.recurringEffect(initialState, 10)
        expect(updatedState.r.toFixed(4)).toEqual((initialState.indicators.r * (1 - 0.419)).toFixed(4))
    })

    it("Does not affect the value of R when the gathering size is unlimited", () => {
        const initialState = cloneDeep(testContext);
        const updatedState = GatheringSize.recurringEffect(initialState, 'Infinity')
        expect(updatedState).toEqual(initialState.indicators);
    })

})