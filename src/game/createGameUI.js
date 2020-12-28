/* eslint-disable no-unused-vars */
import * as $ from 'jquery';
//import 'popper.js';
import 'bootstrap/js/dist/modal';
import { initialisePlayerResearch } from './research';
import { doc } from 'prettier';

/* 
Shorthand functions to create DOM elements

    Arguments
    --------
    type = HTML tag of element to create (string)
    parentEle = parent to append element to (HTML element)
    id = id to give element, optional (string)
*/

const createEle = (type, parentEle, id = null) => {
    const ele = document.createElement(type);
    if (id) {
        ele.id = id;
    }
    parentEle.appendChild(ele);

    return ele;
};

/*

Create Game UI
==============
Description:
Intended to produce elements no the DOM for both viewing and controlling the game.

Use:
Elements created by this method accessed by their IDs

*/
export const createGameUI = (
    gameOptions,
    listOfPlayerActions,
    showWelcomeScreenAtStart,
    onPlayerSelectsAction,
    onEndTurn,
    onUndo,
    onRestart,
) => {

    /* Create buttons */

    // Create button to toggle views
    $('#change-view-button').click(function(){

        $('#view1').toggle();
        $('#view2').toggle();
        
        let label = $('#change-view-button').text();
        if(label === 'Control room'){
            $('#change-view-button').text('Research center');
        }else{
            $('#change-view-button').text('Control room');
        }
    })
    
    // End turn button event handler
    $(`#advance-button`).on('click', () => {
        onEndTurn();
    });

    // Restart button event handler (not currently on DOM)
    $(`#restart-btn`).on('click', () => {
        const isChecked = $('#hide-welcome').is(':checked');
        showWelcomeScreenAtStart(!isChecked);
        onRestart();
    });

    /* Create research */
    initialisePlayerResearch(); // research.js


    /* Create player actions */

    // Create buttons container
    const tableRoot = $(`#player-actions-container`)[0];
    tableRoot.className = 'w-100 d-flex flex-column justify-content-center align-items-middle';

    // Create buttons for player policies
    const btnClickHandler = (e) => {
        // Style as active/inactive
        const target = $(e.target);
        target.toggleClass('player-action-inactive');
        target.toggleClass('player-action-active');

        // Change label text on click
        const label = target.html();
        if (label === target.attr('data-activeLabel')) {
            target.html(target.attr('data-inactiveLabel'));
        } else {
            target.html(target.attr('data-activeLabel'));
        }

        // On player selects action pass action to event
        onPlayerSelectsAction(target.attr('data-action'));
    };
    
    // eslint-disable-next-line no-restricted-syntax
    for (const action of listOfPlayerActions) {

        const btn = createEle('button', tableRoot, `${action.id}`);
        btn.className = `player-action m-2 btn btn-sm player-action-inactive`;
        btn.style.position = 'relative';
        btn.style.zIndex = '200';
        btn.style.height = 'auto';
        btn.setAttribute('data-action', action.id);
        btn.setAttribute('data-inactiveLabel', `${action.inactiveLabel} ${action.name}`);
        btn.setAttribute('data-activeLabel', `${action.activeLabel} ${action.name}`);
        btn.innerHTML = `${action.inactiveLabel} ${action.name}`;
        btn.onclick = btnClickHandler;

    }
};
