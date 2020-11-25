/* eslint-disable no-console */
import $ from 'jquery';
import runGame from './game/game-animation';
import simulation from './simulator/simulation';
import { Simulator } from './simulator/Simulator.ts';
import { US } from './simulator/scenarios/US.ts';

$(window).on('load', () => {
    const simulator = new Simulator(US);
    console.log(simulator.state());
    simulator.nextTurn({
        containmentPolicies: [],
        capabilityImprovements: [],
        inGameEventChoices: []
    });
    console.log(simulator.state());

    const gameWorld = simulation.makeEnv();
    runGame(gameWorld);
});
