import { RecordedInGameEventChoice } from "@src/simulator/in-game-events/InGameEvents";
import { CloseBusinesses } from "@src/simulator/player-actions/CloseBusinesses";
import { CloseSchools } from "@src/simulator/player-actions/CloseSchools";
import { CloseTransit } from "@src/simulator/player-actions/CloseTransit";
import { CapabilityImprovements, ContainmentPolicy } from "@src/simulator/player-actions/PlayerActions";
import { RequireMasks } from "@src/simulator/player-actions/RequireMasks";
import { Scenario } from "@src/simulator/scenarios/Scenarios";
import { GDP_US } from "@src/simulator/scenarios/US";
import { Simulator } from "@src/simulator/Simulator";
import { isNextTurn, NextTurnState, VictoryState } from "@src/simulator/SimulatorState"
import { TimeVictory } from "@src/simulator/victory-conditions/TimeVictory";


export const TestScenario: Scenario = {
    totalPopulation: 400000000, // 400 million people -- i.e. approximate US population
    initialNumInfected: 10000, // 100,000 people infected -- we're in the middle of a pandemic!
    r0: 1.08, // infections double every 10 days
    importedCasesPerDay: 0.1,
    hospitalCapacity: 1000000, // 1 million hospital beds -- https://www.aha.org/statistics/fast-facts-us-hospitals
    gdpPerDay: GDP_US / 365.0,
    power: 1,
    distr_family: 'nbinom',
    dynamics: 'SIS',
    mortality: 0.01,
    time_lumping: false,
    initialContainmentPolicies: [CloseBusinesses, CloseSchools, CloseTransit, RequireMasks],
    initialCapabilityImprovements: [],
    availableInGameEvents: [],
    victoryConditions: [TimeVictory]
};

const emptyPlayerAction = {
    containmentPolicies: [] as ContainmentPolicy[],
    capabilityImprovements: [] as CapabilityImprovements[],
    inGameEventChoices: [] as RecordedInGameEventChoice[]
}

describe("The operation of the Simulator", () => {

    describe("Initialization process", () => {

        it("Can be initialized with a scenario", () => {
            const simulator = new Simulator(TestScenario);
            const s0 = simulator.state();
            expect(s0.scenario).toEqual(TestScenario);
            expect(s0.history.length).toBe(1)
            expect(s0.timeline.length).toBe(0)
        })
    })

    describe("Turn-by-turn operation", () => {

        it("From one turn to the next, if nothing is done the number of infected, and total cost grows", () => {
            // Given a simulator in the initial state:
            const daysPerturn = 10;
            const simulator = new Simulator(TestScenario);
            const initialState = simulator.state();

            // When the next turn is invoked without any player actions
            const nextTurn = simulator.nextTurn(emptyPlayerAction, daysPerturn);

            // Then the pandemic runs its course
            const latestIndicators = nextTurn.lastTurnIndicators[nextTurn.lastTurnIndicators.length - 1]
            if (isNextTurn(nextTurn)) {
                expect(nextTurn.newInGameEvents.length).toBe(0)
                expect(latestIndicators.days).toBe(daysPerturn)
                expect(latestIndicators.totalCost).toBeGreaterThan(0);
                expect(latestIndicators.numInfected).toBeGreaterThan(TestScenario.initialNumInfected);
            } else {
                fail("Unexpected next turn response")
            }
        })

        it("Starts counting dead after the first few turns", () => {
            // Given a simulator instance
            const simulator = new Simulator(TestScenario);

            // When some turns have elapsed
            const minTurns = 25// Give it a few more turns because of randomness
            let nextTurn: NextTurnState | VictoryState
            for (let i = 0; i < minTurns; i++) {
                nextTurn = simulator.nextTurn(emptyPlayerAction);
            }

            // Then we expect some deaths
            if (isNextTurn(nextTurn)) {
                expect(nextTurn.latestIndicators.numDead).toBeGreaterThan(0)
            } else {
                fail("The game should not end at 5 turns in.")
            }

            // And the history has the expected number of turns
            expect(simulator.state().history.length).toBe(minTurns + 1)

        })

        it("With a time based victory condition the game ends after that game period has elapsed", () => {
            // Given a simulator instance
            const daysPerturn = 10;
            const simulator = new Simulator(TestScenario);

            // When the expected number of turns passes
            let days = 0;
            let totalDays = 365;
            let nextTurn: NextTurnState | VictoryState;
            while (days <= totalDays) {
                nextTurn = simulator.nextTurn(emptyPlayerAction, daysPerturn);
                if (isNextTurn(nextTurn)) {
                    days = nextTurn.latestIndicators.days
                } else {
                    break
                }
            }

            if (isNextTurn(nextTurn)) {
                fail("Should have triggered victory condition")
            } else {
                expect(nextTurn.victoryCondition.name).toEqual(TimeVictory.name)
            }
        })

        it("Calls the immediate effect of a player action in the first turn it appears", () => {
            // Given a simulator
            const simulator = new Simulator(TestScenario);

            // When a new player action is added in a turn
            const actionUnderTest = { ...CloseTransit }
            const spyImmediateEffect = jest.spyOn(actionUnderTest, 'immediateEffect')
            const spyRecurringEffect = jest.spyOn(actionUnderTest, 'recurringEffect')
            simulator.nextTurn({
                containmentPolicies: [actionUnderTest as ContainmentPolicy],
                capabilityImprovements: [],
                inGameEventChoices: []
            });
            // Then its immediate effect is called
            expect(spyImmediateEffect).toHaveBeenCalled()
            // And the recurring effect is not called
            expect(spyRecurringEffect).toHaveBeenCalled()

            spyImmediateEffect.mockRestore()
            spyRecurringEffect.mockRestore()
        });

        it("Calls the recurring effect of a player action in the following turns", () => {
            // Given a simulator
            const simulator = new Simulator(TestScenario);

            // When a new player action is added in a turn
            simulator.nextTurn({
                containmentPolicies: [CloseTransit],
                capabilityImprovements: [],
                inGameEventChoices: []
            });

            // And it is active in the next turn as well
            const actionUnderTest = { ...CloseTransit }
            const spyImmediateEffect = jest.spyOn(actionUnderTest, 'immediateEffect')
            const spyRecurringEffect = jest.spyOn(actionUnderTest, 'recurringEffect')
            simulator.nextTurn({
                containmentPolicies: [actionUnderTest],
                capabilityImprovements: [],
                inGameEventChoices: []
            });
            // Then its immediate effect is called
            expect(spyRecurringEffect).toHaveBeenCalled()
            expect(spyImmediateEffect).not.toHaveBeenCalled()

            spyRecurringEffect.mockRestore()
            spyImmediateEffect.mockRestore()
        })

        it("Correctly keeps track of the indicator history items affected by each player turn", () => {
            // Given a simulator instance
            const daysPerturn = 10;
            const numTurns = 10;
            const simulator = new Simulator(TestScenario);

            // When a few turns spanning more that one simulator days pass
            for (let i = 0; i < numTurns; i++) {
                simulator.nextTurn(emptyPlayerAction, daysPerturn);
            }

            // Then the history has the correct number of results
            const currentState = simulator.state();
            expect(currentState.history.length).toEqual(daysPerturn * numTurns + 1) // The initial indicators are appended on the first turn

            // And the turn history has no gaps and spans the correct number of items
            expect(currentState.timeline.length).toEqual(10);
        });
    })

    describe("The restart process", () => {

        it("Can be restarted, back to the initial state", () => {
            // Given a simulator instance
            const simulator = new Simulator(TestScenario);

            // And it has been running for a few turns
            for (let i = 0; i < 10; i++) {
                simulator.nextTurn({
                    containmentPolicies: [CloseTransit],
                    capabilityImprovements: [],
                    inGameEventChoices: []
                });
            }
            // When it is reset
            const resetSimulator = simulator.reset()

            // Then the new simulator instance is at the first turn
            const resetState = resetSimulator.state()
            expect(resetState.history.length).toBe(1)
            expect(resetState.scenario).toEqual(simulator.state().scenario)
            expect(resetState.timeline.length).toBe(0)
        })

        it("Can be restarted, back to a previous point in time", () => {
            // Given a simulator instance
            const simulator = new Simulator(TestScenario);
            const daysPerTurn = 10;

            // And it has been running for a few turns
            for (let i = 0; i < 10; i++) {
                simulator.nextTurn({
                    containmentPolicies: [CloseTransit],
                    capabilityImprovements: [],
                    inGameEventChoices: []
                }, daysPerTurn);

            }
            // When it is reset
            const targetTurn = 5;
            const resetSimulator = simulator.reset(targetTurn)

            // Then the new simulator instance is at the first turn
            const resetState = resetSimulator.state()
            // We are now at turn 5, with 4 turns in the player action history
            expect(resetState.timeline.length).toBe(targetTurn - 1)

            // And the last item in the history is the last item of the previous turn prior to the reset
            expect(resetState.history.length).toBe((targetTurn - 1) * daysPerTurn + 1)
        })

        it("Operates normally after being restored to a previous point in time", () => {
            // Given a simulator instance
            const simulator = new Simulator(TestScenario);

            // And it has been running for a few turns
            for (let i = 0; i < 10; i++) {
                simulator.nextTurn({
                    containmentPolicies: [CloseTransit],
                    capabilityImprovements: [],
                    inGameEventChoices: []
                });
            }
            // And it is reset
            expect(simulator.state().history.length).toBe(11)
            const resetSimulator = simulator.reset(5)

            // Then the reset simulator works normally
            for (let i = 0; i < 6; i++) {
                resetSimulator.nextTurn({
                    containmentPolicies: [CloseSchools],
                    capabilityImprovements: [],
                    inGameEventChoices: []
                });
            }
            // And the histories difer
            const resetState = resetSimulator.state()
            const originalState = simulator.state()

            expect(resetState.history.length).toBe(11)
            expect(resetState.history.length).toEqual(originalState.history.length)

            const newPolicyHistory = resetState.timeline.map(it => it.playerActions.containmentPolicies.map(p => p.name).join(',')).join('|')
            const originalPolicyHistory = originalState.timeline.map(it => it.playerActions.containmentPolicies.map(p => p.name).join(',')).join('|')
            expect(newPolicyHistory).not.toEqual(originalPolicyHistory)
        })
    })
})
