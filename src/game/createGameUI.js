/* eslint-disable no-unused-vars */
import * as $ from 'jquery';
import { LinePlot } from '../lib/LinePlot';
import { nFormatter } from '../lib/util';
import * as bootstrap from 'bootstrap'; // required to have bootstrap widgets on jquery
import { months } from '../lib/util';

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

// Create elements on DOM
export const createGameUI = (
    listOfPlayerActions,
    onPlayerSelectsAction,
    onEndTurn,
    onRestart,
    numberOfColumns = 12
) => {
    const table = $(`#player-actions-container`)[0];
    // Create n columns in grid

    const header = createEle('tr', table);

    const empty = createEle('td', header);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < numberOfColumns; i++) {
        const date = createEle('td', header);
        date.innerHTML = months[i];
        date.style.textAlign = 'center';
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const action of listOfPlayerActions) {
        const tr = createEle('TR', table);
        const title = createEle('TD', tr);
        title.innerHTML = action.name;
        title.style.width = '190px';
        title.style.textAlign = 'right';
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < numberOfColumns; i++) {
            const td = createEle('TD', tr);

            const btn = createEle('BUTTON', td, `turn${i}-${action.id}`);
            btn.className = `player-action m-2 btn btn-sm`;
            btn.style.height = 'auto';
            btn.style.width = '80px'; // '100%';
            btn.setAttribute('data-action', action.id);
            btn.style.position = 'relative';
            btn.innerHTML = `<i class="fa ${action.icon}"></i>`;
            btn.onclick = (e) => {
                // Style as active/inactive
                const target = $(e.target);
                target.toggleClass('btn-light');
                target.toggleClass('btn-success');

                // On player selects action pass action to event
                onPlayerSelectsAction(target.attr('data-action'));
            };
        }
    }

    $(`#end-turn-btn`).on('click', () => {
        onEndTurn();
    });
    $(`#restart-btn`).on('click', () => {
        onRestart();
    });
};
