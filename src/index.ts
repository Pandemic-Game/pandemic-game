import { GameEngine } from './game/GameEngine';
import { US } from './simulator/scenarios/US';
import * as $ from 'jquery';
import 'bootstrap/js/dist/modal';

let gameEngine;

$(window).on('load', () => {
    gameEngine = new GameEngine(US);
    gameEngine.start();
});

$(window).on('resize', () => {
	gameEngine.updateSize();
});
