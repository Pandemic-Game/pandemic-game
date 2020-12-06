import { SimulatorState } from '../SimulatorState';

export interface VictoryCondition {
    name: string;
    description: string;
    isMet(simulatorState: SimulatorState): boolean;
}
