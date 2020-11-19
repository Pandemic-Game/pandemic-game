import $ from 'jquery';
import runGame from './game/game-animation';
import simulation from './lib/simulation';
import { Simulator } from './lib/Simulator.ts';
import { US } from './lib/Scenarios.ts';

$(window).on('load', () => {
    const simulator = new Simulator(US);
    console.log(simulator.state());
    simulator.nextTurn({
        containmentPolicies: [],
        capabilityImprovements: [],
    });
    console.log(simulator.state());

    const gameWorld = simulation.makeEnv();
    runGame(gameWorld);
});
