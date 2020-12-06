import { SimulatorState2 } from '../Simulator2';
import { SimulatorState } from '../SimulatorState';

export interface VictoryCondition {
    name: string;
    description: string;
    isMet(simulatorState: SimulatorState2): boolean;
}
