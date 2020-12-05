import { SimulatorState } from '../SimulatorState';
import { VictoryCondition } from './VictoryConditon';

export const RaceToZero: VictoryCondition = {
    name: 'Zero infections in the last 30 days',
    description: 'Infections are at zero for the past 30 days.',
    isMet: (simulatorState: SimulatorState) => {
        if (simulatorState.currentState.days < 30) {
            return false;
        } else {
            const cutOff = simulatorState.currentState.days - 30;
            //Figure out how many items of the history we need to fetch beyond the current state.
            const relevantSliceOfHistory = [simulatorState.currentState.indicators];
            for (let i = simulatorState.history.length; i > 0; i--) {
                const prevEntry = simulatorState.history[i - 1];
                if (prevEntry.days > cutOff) {
                    relevantSliceOfHistory.push(prevEntry);
                } else {
                    break;
                }
            }

            return !relevantSliceOfHistory.some((it) => it.numInfected > 0);
        }
    }
};
