import $ from 'jquery';
import runGame from './game/game-animation';
import simulation from './lib/simulation';
import { doctrines } from './lib/PlayerActions';

$(window).on('load', () => {
    console.log(doctrines);
    const gameWorld = simulation.makeEnv();
    runGame(gameWorld);
});
