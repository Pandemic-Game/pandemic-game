import { SimulatorState } from './SimulatorState';

export interface VictoryCondition {
    name: string;
    description: string;
    isMet(simulatorState: SimulatorState): boolean;
}

export const TimeVictory: VictoryCondition = {
    name: 'Time victory',
    description: 'You managed to survice one year!',
    isMet: (simulatorState: SimulatorState) => simulatorState.currentState.days >= 365
};

export const RaceToZero: VictoryCondition = {
    name: 'Zero infections in the last 30 days',
    description: 'Infections are at zero for the past 30 days.',
    isMet: (simulatorState: SimulatorState) => {
        if (simulatorState.currentState.days < 30) {
            return false;
        } else {
            const cutOff = simulatorState.currentState.days - 30;
            //Figure out how many items of the history we need to fetch beyond the current state.
            const relevantSliceOfHistory = [simulatorState.currentState];
            for (let i = simulatorState.history.length; i > 0; i--) {
                const prevEntry = simulatorState.history[i - 1];
                if (prevEntry.days > cutOff) {
                    relevantSliceOfHistory.push(prevEntry);
                } else {
                    break;
                }
            }

            return !relevantSliceOfHistory.some((it) => it.indicators.numInfected > 0);
        }
    }
};
