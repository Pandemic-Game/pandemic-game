import $ from 'jquery';
import runGame from './game/game-animation';
import simulation from './lib/simulation';

$(window).on('load', () => {
    const gameWorld = simulation.makeEnv();
    console.log(gameWorld);
    runGame(gameWorld);
});
