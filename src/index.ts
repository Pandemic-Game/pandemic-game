import { GameEngine } from './game/game-engine';
import { US } from './simulator/scenarios/US';
import * as $ from 'jquery';
import 'bootstrap/js/dist/modal';


$(window).on('load', () => {
    const gameEngine = new GameEngine(US);
    gameEngine.start();
});
