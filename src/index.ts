import { GameEngine } from './game/GameEngine';
import { US } from './simulator/scenarios/US';
import * as $ from 'jquery';
//import 'popper.js';

let gameEngine;

$(window).on('load', () => {
    gameEngine = new GameEngine(US);
    gameEngine.start();
});

$(window).on('resize', () => {
	gameEngine.updateSize();
});
