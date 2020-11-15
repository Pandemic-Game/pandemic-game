import { Indicators, SimulatorState } from "./SimulatorState";
/**
 * Doctrines are mutually exclusive high level containment policies. Example: "full lockdown" and "business as usual" are
 * two fundamentally different approaches to pandemic management.
 */
export interface ContainmentDoctrine {
    name: string,
    immediateEffect: (context: SimulatorState) => Indicators
    recurringEffect: (context: SimulatorState) => Indicators
}

export const doctrines: ContainmentDoctrine[] = [
    {
        name: "Full lockdown",
        immediateEffect: (context) => {
            const updatedIndicators = { ...context.currentState.indicators };
            updatedIndicators.wellbeing = updatedIndicators.wellbeing * 0.5
            return updatedIndicators;
        },
        recurringEffect: (context) => {
            const updatedIndicators = { ...context.currentState.indicators };
            updatedIndicators.r = 0.95
            return updatedIndicators;
        }
    },
    {
        name: "New normal",
        immediateEffect: (context) => {
            const updatedIndicators = { ...context.currentState.indicators };
            updatedIndicators.wellbeing = updatedIndicators.wellbeing * 0.8
            return updatedIndicators;
        },
        recurringEffect: (context) => {
            const updatedWorldState = { ...context.currentState.indicators };
            updatedWorldState.r = 1.0
            return updatedWorldState;
        }
    },
    {
        name: "Business as usual",
        immediateEffect: (context) => context.currentState.indicators,
        recurringEffect: (context) => {
            const updatedIndicators = { ...context.currentState.indicators };
            updatedIndicators.r = 1.08
            return updatedIndicators;
        }
    },
]

/**
 * Containment policies are specific actions that can be taken in conjunction, in the context of a containment doctrine,
 * assuming the required capability improvement requirements are met.
 */
export interface ContainmentPolicy {
    doctrine: ContainmentDoctrine
    requirements: CapabilityImprovements[]
    name: string
    immediateEffect: (worldState: Indicators) => Indicators
    recurringEffect: (worldState: Indicators) => Indicators
}

/**
 * Represents specific improvements to the healthcare sector (e.g. contact tracing infrastructure)
 */
export interface CapabilityImprovements {
    name: string,
    immediateEffect: (worldState: Indicators) => Indicators
    recurringEffect: (worldState: Indicators) => Indicators
}

