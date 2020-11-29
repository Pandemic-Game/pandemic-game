import { GameEngine } from './game/game-engine';
import { US } from './simulator/scenarios/US';
import * as $ from 'jquery';

$(window).on('load', () => {
    const gameEngine = new GameEngine(US);
    gameEngine.start();
});
