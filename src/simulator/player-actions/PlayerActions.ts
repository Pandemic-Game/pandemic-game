import { Indicators, WorldState } from '../SimulatorState';

/**
 * Containment policies are specific actions that can be taken in conjunction, in the context of a containment doctrine,
 * assuming the required capability improvement requirements are met.
 */
export interface ContainmentPolicy {
    id: string;
    icon: string;
    requirements: CapabilityImprovements[];
    name: string;
    activeLabel: string,
    inactiveLabel: string,
    immediateEffect: (context: WorldState) => Indicators;
    recurringEffect: (context: WorldState) => Indicators;
}

/**
 * Represents specific improvements to the healthcare sector (e.g. contact tracing infrastructure)
 */
export interface CapabilityImprovements {
    name: string;
    immediateEffect: (context: WorldState) => Indicators;
    recurringEffect: (context: WorldState) => Indicators;
}
