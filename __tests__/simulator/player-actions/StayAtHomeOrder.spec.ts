import cloneDeep from 'lodash/cloneDeep';
import { WorldState } from "@src/simulator/SimulatorState";
import { WorldStateFactory } from './TestHelpers';
import { StayAtHomeOrder } from '@src/simulator/player-actions/PlayerActions2';

describe("The behaviour and effect of the stay at home order", () => {

    const testContext: WorldState = WorldStateFactory.empty()

    it("Has no extra effect when it becomes active", () => {
        const initialState = cloneDeep(testContext);
        const updatedState = StayAtHomeOrder.immediateEffect(initialState, true)
        expect(updatedState).toEqual(initialState.indicators);
    })

    it("Reduces the value of R by 77.2% when active", () => {
        const initialState = cloneDeep(testContext);
        const updatedState = StayAtHomeOrder.recurringEffect(initialState, true)
        expect(updatedState.r.toFixed(4)).toEqual((initialState.indicators.r * (1 - 0.772)).toFixed(4))
    })

    it("Does not affect the value of R when not active", () => {
        const initialState = cloneDeep(testContext);
        const updatedState = StayAtHomeOrder.recurringEffect(initialState, false)
        expect(updatedState).toEqual(initialState.indicators);
    })

})