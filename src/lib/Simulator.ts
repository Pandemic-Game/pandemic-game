import { CapabilityImprovements, ContainmentPolicy } from "./PlayerActions";
import { RandomEvent } from "./RandomEvents";
import { NexTurnState, PlayerAction, SimulatorState, WorldSetup, WorldState } from "./SimulatorState";


class Simulator {

    private initialState: WorldSetup
    private currentState: WorldState
    private history: WorldState[]

    constructor(initialState: WorldSetup) {
        this.initialState = initialState
    }

    //TODO: add guards to guarantee that player actions and capability improvements match the expectations.
    nextTurn(actionsInTurn: PlayerAction): NexTurnState {
        // Start by figuring out the baseline world state for the next turn
        const nextSimulatorState = this.clone(this.getCurrentState())
        // Update the indicators based on the existing world state
        nextSimulatorState.currentState = this.computeNextWorldState(nextSimulatorState)

        // Factor in any new player actions and random events.
        const newPlayerActions: ContainmentPolicy[] = this.findNewContainmentPolicies(actionsInTurn.containmentPolicies)
        for (const containmentPolicy of newPlayerActions) {
            nextSimulatorState.currentState.indicators = containmentPolicy.immediateEffect(nextSimulatorState)
        }

        const newCapabilities: CapabilityImprovements[] = this.findNewCapabilities(actionsInTurn.capabilityImprovements)
        for (const capability of newCapabilities) {
            actionsInTurn
            nextSimulatorState.currentState.indicators = capability.immediateEffect(nextSimulatorState)
        }

        const newRandomEvents: RandomEvent[] = this.pickRandomEvent(nextSimulatorState)
        for (const randomEvent of newRandomEvents) {
            nextSimulatorState.currentState.indicators = randomEvent.immediateEffect(nextSimulatorState)
        }

        // Update the actions and random events.
        nextSimulatorState.currentState.playerActions = actionsInTurn
        nextSimulatorState.currentState.randomEvents = nextSimulatorState.currentState.randomEvents.concat(newRandomEvents)

        // store the old previous state in the history
        this.history.push(this.currentState)
        this.currentState = nextSimulatorState.currentState

        return this.clone({
            newRandomEvents: newRandomEvents,
            currentState: this.currentState
        });
    }

    getCurrentState(): SimulatorState {
        const simulatorStateSnapshot: SimulatorState = {
            initialState: this.initialState,
            currentState: this.currentState,
            history: this.history
        }
        // Return an immutable copy of the state.
        return this.clone(simulatorStateSnapshot)
    }

    private clone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj))
    }
}