import { GameEngine } from './game/game-engine';
import { US } from './simulator/scenarios/US';
import * as $ from 'jquery';
import { createGameUI } from './public/ui/createGameUI';
import { setControlsToTurn } from './public/ui/setGameUI';
import { listOfPlayerActions, onEndTurn, onPlayerSelectsAction } from './public/ui/TEMP_gameEngineOutputs';

$(window).on('load', () => {
    // const gameEngine = new GameEngine(US);
    // gameEngine.start();

    createGameUI(listOfPlayerActions, onPlayerSelectsAction, onEndTurn);
    setControlsToTurn(0, listOfPlayerActions);
});
