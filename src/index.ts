import { GameEngine } from './game/GameEngine';
import { US } from './simulator/scenarios/US';
import * as $ from 'jquery';
import 'bootstrap/js/dist/modal';

$(window).on('load', () => {
    let gameEngine = new GameEngine(US);
    gameEngine.start();

    $(window).on('resize', () => {
        gameEngine.updateSize();
    });
});
