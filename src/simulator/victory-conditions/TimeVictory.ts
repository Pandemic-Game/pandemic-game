import { SimulatorState } from '../SimulatorState';
import { VictoryCondition } from './VictoryConditon';

export const TimeVictory: VictoryCondition = {
    name: 'Time victory',
    description: 'You managed to survice one year!',
    isMet: (simulatorState: SimulatorState) => {
        return simulatorState.history.length > 0
            ? simulatorState.history[simulatorState.history.length - 1].days >= 365
            : false;
    }
};
