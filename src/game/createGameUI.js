/* eslint-disable no-unused-vars */
import * as $ from 'jquery';

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

    const tableRoot = $(`#player-actions-container`)[0];

    // Create table 
    const header = createEle('tr', tableRoot);

    const btnClickHandler = (e) => {
        // Style as active/inactive
        const target = $(e.target);
        target.toggleClass('btn-light');
        target.toggleClass('btn-success');

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

    // Create the table body
    const tableBody = createEle('tbody', tableRoot);
    
    // eslint-disable-next-line no-restricted-syntax
    for (const action of listOfPlayerActions) {
        const tr = createEle('tr', tableBody);
        const title = createEle('td', tr);
        title.innerHTML = action.name;
        title.className = 'noselect';
        title.style.textAlign = 'right';
        title.style.width = '115px';

        const td = createEle('td', tr);
        const btn = createEle('button', td, `${action.id}`);
        btn.className = `player-action m-2 btn btn-sm`;
        btn.style.position = 'relative';
        btn.style.zIndex = '200';
        btn.style.height = 'auto';
        btn.style.width = 250;
        btn.setAttribute('data-action', action.id);
        btn.setAttribute('data-inactiveLabel', action.inactiveLabel);
        btn.setAttribute('data-activeLabel', action.activeLabel);
        btn.innerHTML = action.inactiveLabel;
        btn.onclick = btnClickHandler;

    }

    const tr = createEle('tr', tableBody);
    const title = createEle('td', tr);
    title.innerHTML = 'advance-button';
    title.className = 'noselect';
    title.style.textAlign = 'right';
    title.style.width = '115px';
    const td = createEle('td', tr);
    const btn = createEle('button', td, `advance-button`);
    btn.name = 'Go forwards in time';
    btn.type = 'button';
    btn.style.position = 'relative';
    btn.style.zIndex = '200';
    btn.style.height = 'auto';
    btn.style.width = '80px'; // '100%';
    btn.innerHTML = 'Advance' ; 
    btn.onclick = onEndTurn; // END TURN EVENT (in GameEngine.ts)

    // Add extra event handlers
    $(`#restart-btn`).on('click', () => {
        const isChecked = $('#hide-welcome').is(':checked');
        showWelcomeScreenAtStart(!isChecked);
        onRestart();
    });
};
