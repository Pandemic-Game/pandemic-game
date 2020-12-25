import { ContainmentPolicy } from './player-actions/PlayerActions';
import {
    Indicators,
    NextTurnState,
    PlayerActions,
    SimulatorState,
    TimelineEntry,
    VictoryState,
    WorldState
} from './SimulatorState';
import { FakeNegativeBinomial } from '../lib/Probabilities';
import jStat from 'jstat';
import { Scenario } from './scenarios/Scenarios';
import { VictoryCondition } from './victory-conditions/VictoryConditon';
import cloneDeep from 'lodash/cloneDeep';
import { InGameEvent } from './in-game-events/InGameEvents';

export class Simulator {
    private scenario: Scenario;
    private scaleFactor: number;
    private currentTurn: WorldState;
    private timeline: TimelineEntry[];

    constructor(scenario: Scenario) {
        this.scenario = scenario;
        this.scaleFactor = scenario.gdpPerDay * 0.35;
        this.currentTurn = this.computeInitialWorldState();
        this.timeline = [];
    }

    reset(turn: number = 0): Simulator {
        const newSimulator = new Simulator(this.scenario);
        const baseline = turn - 1;
        if (baseline > 0 && this.timeline.length >= baseline) {
            const targetTurn = this.timeline[baseline - 1];
            newSimulator.timeline = this.clone(this.timeline.slice(0, baseline));

            const history = newSimulator.mutableHistory();
            newSimulator.currentTurn = this.clone({
                ...targetTurn,
                indicators: history[history.length - 1]
            });
        } else {
            newSimulator.timeline = [];
            newSimulator.currentTurn = this.computeInitialWorldState();
        }

        return newSimulator;
    }

    lastTurn(): number {
        return this.timeline.length;
    }

    /**
     * Allows the caller to obtain a snapshot of the current simulator state.
     */
    private mutableState(): SimulatorState {
        return {
            scenario: this.scenario,
            currentTurn: this.currentTurn,
            timeline: this.timeline,
            history: this.mutableHistory()
        };
    }

    state(): SimulatorState {
        // Return an immutable copy of the state.
        return this.clone(this.mutableState());
    }

    history(): Indicators[] {
        return this.clone(this.mutableHistory());
    }

    private mutableHistory(): Indicators[] {
        return this.timeline.length === 0 ? [this.currentTurn.indicators] : this.timeline.flatMap((it) => it.history);
    }

    /**
     * Processes the next turn by computing the effects of player actions, random events and the natural
     * progression of the epidemic.
     */
    nextTurn(playerActions: PlayerActions, daysToAdvance: number = 1): NextTurnState | VictoryState {
        // Store player previous player turn
        let stateAtTurnEnd = this.clone(this.currentTurn);
        // Reset the baseline R for the turn
        stateAtTurnEnd.indicators.r = this.scenario.r0;

        // Factor in any new player actions.
        const newContainmentPolicies: ContainmentPolicy[] = this.findNewContainmentPolicies(
            playerActions.containmentPolicies
        );
        for (const containmentPolicy of newContainmentPolicies) {
            stateAtTurnEnd.indicators = containmentPolicy.immediateEffect(stateAtTurnEnd);
        }

        // Factor in the recurring effects of existing player actions.
        for (const containmentPolicy of playerActions.containmentPolicies) {
            stateAtTurnEnd.indicators = containmentPolicy.recurringEffect(stateAtTurnEnd);
        }

        // Add the new containment policies to the history of player actions
        stateAtTurnEnd.playerActions.containmentPolicies = playerActions.containmentPolicies;

        // Advance world timeline the desired number of days
        let latestIndicators;
        let indicatorsAtTurnStart = this.currentTurn.indicators;
        // The initial state is added on the first play
        let history = this.timeline.length === 0 ? [this.currentTurn.indicators] : [];
	    let complete_history = this.mutableHistory().concat(history);
        for (let i = 0; i < daysToAdvance; i++) {
            latestIndicators = this.computeNextPandemicDay(stateAtTurnEnd, indicatorsAtTurnStart, complete_history);
            indicatorsAtTurnStart = latestIndicators;
            // Add the last indicators to the world timeline.
            history.push(this.clone(latestIndicators));
	        complete_history = this.mutableHistory().concat(history);
        }

        // Update the next turn's indicators
        stateAtTurnEnd.indicators = latestIndicators;

        // Advance the current turn to match the state at turn end.
        this.currentTurn = stateAtTurnEnd;
        this.timeline.push(
            this.clone({
                ...stateAtTurnEnd,
                history: history
            })
        );

        // Add any new random events that will trigger on the next turn at this point in time
        // These will be in effect in the next turn
        this.currentTurn.nextInGameEvents = this.pickNextGameEvents();

        console.log("history: ")
	console.log(this.mutableHistory())

	console.log("timeline: ")
	console.log(this.timeline)

        // Check if victory conditions are met.
        const victoryCondition = this.isVictorious();
        if (victoryCondition) {
            return this.computeVictory(victoryCondition);
        } else {
            return this.clone({
                newInGameEvents: this.currentTurn.nextInGameEvents,
                lastTurnIndicators: history,
                latestIndicators: latestIndicators
            });
        }
    }

    private isVictorious(): VictoryCondition | undefined {
        return this.scenario.victoryConditions.find((it) =>
            it.isMet({
                scenario: this.scenario,
                currentTurn: this.currentTurn,
                timeline: this.timeline,
                history: this.mutableHistory()
            })
        );
    }

    private computeVictory(victoryCondition: VictoryCondition): VictoryState {
        return this.clone({
            lastTurnIndicators: this.timeline[this.timeline.length - 1].history,
            score: this.mutableHistory().reduce((prev, current) => {
                return prev + current.totalCost;
            }, 0),
            victoryCondition: victoryCondition
        });
    }

    private computeNextPandemicDay(candidateState: WorldState, lastResult: Indicators, history: Indicators[]): Indicators {
        let actionR = candidateState.indicators.r;
        const prevCases = lastResult.numInfected;

    /* Disabled debugger for testing in browser console because this line pauses it */
	//debugger;

        // Don't allow cases to exceed hospital capacity
        const hospitalCapacity = lastResult.hospitalCapacity;
        const lockdownRatio = hospitalCapacity / prevCases;
        const cappedActionR = prevCases * actionR >= hospitalCapacity ? lockdownRatio : actionR;
        actionR = cappedActionR;

        // Compute next state

        const currentDay = lastResult.days + 1;
        const lag = 20;
        const long_enough = history.length >= lag;
        
        // new number of infected people
        let new_num_infected = this.generateNewCasesFromDistribution(prevCases, actionR);
        new_num_infected = Math.max(Math.floor(new_num_infected), 0);
        new_num_infected = Math.min(new_num_infected, this.scenario.totalPopulation);
        // new number of symptomized and hospitalized people
        const symptom_rate = this.scenario.symptom_rate;
        const new_num_symptomized = long_enough ? history[history.length - lag].numInfected * symptom_rate : 0;
        const new_num_hospitalized = new_num_symptomized < hospitalCapacity ? new_num_symptomized : hospitalCapacity;
        // Deaths from infections started 20 days ago
        const mortality = this.scenario.mortality;
	console.log("history.length");
	console.log(history.length);
        const new_deaths_lagging = long_enough ? history[history.length - lag].numInfected * mortality : 0;
        
        // compute economics 

        // GDP
        const new_gdp = this.computeGDP(candidateState.indicators.GDP);
        // Costs
        const deathCosts = this.computeDeathCost(new_deaths_lagging);
        const economicCosts = this.computeEconomicCosts(actionR);
        const medicalCosts = this.computeHospitalizationCosts(new_num_infected);
        return {
            days: currentDay,
            numDead: new_deaths_lagging,
            numHospitalized : new_num_hospitalized,
            numInfected: new_num_infected,
            totalPopulation: this.scenario.totalPopulation,
            hospitalCapacity: this.scenario.hospitalCapacity,
            r: candidateState.indicators.r,
            importedCasesPerDay: this.scenario.importedCasesPerDay,
            deathCosts: deathCosts,
            economicCosts: economicCosts,
            medicalCosts: medicalCosts,
            totalCost: deathCosts + economicCosts + medicalCosts,
            GDP: new_gdp
        };
    }

    private computeInitialWorldState(): WorldState {
        // TODO: The hospitalization costs will not be zero on the first turn!
        const deathCosts = this.computeDeathCost(0);
        const economicCosts = this.computeEconomicCosts(this.scenario.r0);
        const medicalCosts = this.computeHospitalizationCosts(this.scenario.initialNumInfected);
        return {
            availablePlayerActions: {
                capabilityImprovements: this.scenario.initialCapabilityImprovements,
                containmentPolicies: this.scenario.initialContainmentPolicies
            },
            indicators: {
                days: 0,
                numDead: 0,
                numInfected: this.scenario.initialNumInfected,
                totalPopulation: this.scenario.totalPopulation,
                hospitalCapacity: this.scenario.hospitalCapacity,
                r: this.scenario.r0,
                importedCasesPerDay: this.scenario.importedCasesPerDay,
                deathCosts: deathCosts,
                economicCosts: economicCosts,
                medicalCosts: medicalCosts,
                numHospitalized: 0,
                totalCost: deathCosts + economicCosts + medicalCosts,
                GDP: this.scenario.start_GDP
            },
            playerActions: {
                capabilityImprovements: [],
                containmentPolicies: [],
                inGameEventChoices: []
            },
            nextInGameEvents: []
        };
    }

    private computeDeathCost(numDead: number): number {
        const costPerDeath = 1e7; // https://www.npr.org/transcripts/835571843: value of a statistical life
        return numDead * costPerDeath;
    }

    private computeHospitalizationCosts(numInfected: number): number {
        const hospitalization_rate = 0.1; // 10% of those infected will require hospitalization
        const num_hospitalizations = numInfected * hospitalization_rate;
        const cost_per_hospitalization = 50000; // $50,000 per hospital visit -- average amount billed to insurance (can dig up this reference if needed; it was on this order of magnitude)

        return num_hospitalizations * cost_per_hospitalization;
    }

    private computeEconomicCosts(r: number): number {
        if (r >= this.scenario.r0) {
            return 0;
        }
	const daysTilDoubling = 10;
	const growthRateOriginal = this.scenario.r0 ** daysTilDoubling;
	const growthRateNew = r ** daysTilDoubling;
        return (this.scaleFactor * (growthRateOriginal - growthRateNew)) / growthRateOriginal;
    }

    private computeGDP(GDP: number): number {
        if ( GDP >= this.scenario.start_GDP - this.scenario.GDP_normal_fluctuation ) {
            const gdp_growth = (Math.random() * this.scenario.GDP_normal_fluctuation) - ( 0.5 * this.scenario.GDP_normal_fluctuation) ;
            return GDP + gdp_growth;
        } else {
            return GDP * (1 + this.scenario.GDP_bounce_back_rate);
        }
    }

    private generateNewCasesFromDistribution(num_infected: number, action_r: number) {
        const lam = this.generateNewCases(num_infected, action_r);
        const r_single_chain = 0.17; // 50.0;
        const lam_single_chain = 1.0 * action_r;
        const p_single_chain = lam_single_chain / (r_single_chain + lam_single_chain);

        const single_chain_distr = new FakeNegativeBinomial(r_single_chain, p_single_chain);
        const new_num_infected_mean = single_chain_distr.getMean() * lam;
        const new_num_infected_variance = single_chain_distr.getVariance() * lam;

        const new_num_infected = Math.max(
            0,
            Math.floor(jStat.normal.sample(new_num_infected_mean, new_num_infected_variance ** 0.5))
        );

        return new_num_infected + this.currentTurn.indicators.importedCasesPerDay; // remove stochasticity; was: return new_num_infected;
    }

    private generateNewCases(numInfected: number, r: number) {
        const fractionSusceptible = 1; // immune population?
        const expectedNewCases = numInfected * r * fractionSusceptible; // + this.currentTurn.indicators.importedCasesPerDay;
        return expectedNewCases;
    }

    private findNewContainmentPolicies(containmentPoliciesOfTurn: ContainmentPolicy[]): ContainmentPolicy[] {
        const previousPolicies = this.currentTurn.playerActions.containmentPolicies.map((it) => it.name);
        return containmentPoliciesOfTurn.filter(
            (containmentPolicy) => previousPolicies.indexOf(containmentPolicy.name) == -1
        );
    }

    private pickNextGameEvents(): InGameEvent[] {
        const result: InGameEvent[] = [];
        const state = this.mutableState();
        const eventHistory = this.timeline
            .reduce((evts, current) => {
                return evts.concat(current.nextInGameEvents);
            }, [])
            .map((it) => it.name);
        this.scenario.availableInGameEvents.map((it) => {
            const happensOnceAndHasNotHappened = it.happensOnce && eventHistory.indexOf(it.name) != -1;
            if ((happensOnceAndHasNotHappened || !it.happensOnce) && it.canActivate(state)) {
                result.push(it);
            }
        });
        return result;
    }

    private clone<T>(obj: T): T {
        return cloneDeep(obj);
    }
}
