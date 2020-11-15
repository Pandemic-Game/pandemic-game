import { WorldState } from "./SimulatorState";
/**
 * Doctrines are mutually exclusive high level containment policies. Example: "full lockdown" and "business as usual" are
 * two fundamentally different approaches to pandemic management.
 */
export interface ContainmentDoctrine {
    name: string,
    immediateEffect: (worldState: WorldState) => WorldState
    recurringEffect: (worldState: WorldState) => WorldState
}

export const doctrines: ContainmentDoctrine[] = [
    {
        name: "Full lockdown",
        immediateEffect: (worldState) => {
            const updatedWorldState = { ...worldState };
            updatedWorldState.wellbeing = updatedWorldState.wellbeing * 0.5
            return updatedWorldState;
        },
        recurringEffect: (worldState) => {
            const updatedWorldState = { ...worldState };
            updatedWorldState.r = 0.95
            return updatedWorldState;
        }
    },
    {
        name: "New normal",
        immediateEffect: (worldState) => {
            const updatedWorldState = { ...worldState };
            updatedWorldState.wellbeing = updatedWorldState.wellbeing * 0.8
            return updatedWorldState;
        },
        recurringEffect: (worldState) => {
            const updatedWorldState = { ...worldState };
            updatedWorldState.r = 1.0
            return updatedWorldState;
        }
    },
    {
        name: "Business as usual",
        immediateEffect: (worldState) => worldState,
        recurringEffect: (worldState) => {
            const updatedWorldState = { ...worldState };
            updatedWorldState.r = 1.08
            return updatedWorldState;
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
    immediateEffect: (worldState: WorldState) => WorldState
    recurringEffect: (worldState: WorldState) => WorldState
}

/**
 * Represents specific improvements to the healthcare sector (e.g. contact tracing infrastructure)
 */
export interface CapabilityImprovements {
    name: string,
    immediateEffect: (worldState: WorldState) => WorldState
    recurringEffect: (worldState: WorldState) => WorldState
}

