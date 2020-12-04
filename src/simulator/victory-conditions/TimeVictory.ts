import { SimulatorState } from '../SimulatorState';
import { VictoryCondition } from './VictoryConditon';

export const TimeVictory: VictoryCondition = {
    name: 'Time victory',
    description: 'You managed to survice one year!',
    isMet: (simulatorState: SimulatorState) => simulatorState.currentState.days >= 365
};
