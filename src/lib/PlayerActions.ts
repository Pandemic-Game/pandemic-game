import { Indicators, WorldState } from "./SimulatorState";

/**
 * Containment policies are specific actions that can be taken in conjunction, in the context of a containment doctrine,
 * assuming the required capability improvement requirements are met.
 */
export interface ContainmentPolicy {
    requirements: CapabilityImprovements[]
    name: string
    immediateEffect: (context: WorldState) => Indicators
    recurringEffect: (context: WorldState) => Indicators
}

export const containmentPolicies: ContainmentPolicy[] = [
    {
        name: "Full lockdown",
        requirements: [],
        immediateEffect: (context) => context.indicators,
        recurringEffect: (context) => {
            const updatedIndicators = { ...context.indicators };
            updatedIndicators.r = 0.95
            return updatedIndicators;
        }
    },
    {
        name: "New normal",
        requirements: [],
        immediateEffect: (context) => context.indicators,
        recurringEffect: (context) => {
            const updatedWorldState = { ...context.indicators };
            updatedWorldState.r = 1.0
            return updatedWorldState;
        }
    },
    {
        name: "Business as usual",
        requirements: [],
        immediateEffect: (context) => context.indicators,
        recurringEffect: (context) => {
            const updatedIndicators = { ...context.indicators };
            updatedIndicators.r = 1.08
            return updatedIndicators;
        }
    },
]


/**
 * Represents specific improvements to the healthcare sector (e.g. contact tracing infrastructure)
 */
export interface CapabilityImprovements {
    name: string,
    immediateEffect: (context: WorldState) => Indicators
    recurringEffect: (context: WorldState) => Indicators
}

