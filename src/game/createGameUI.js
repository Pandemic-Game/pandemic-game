/* eslint-disable no-unused-vars */
import * as $ from 'jquery';
import * as bootstrap from 'bootstrap'; // required to have bootstrap widgets on jquery
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
    const row = $(`#player-actions-container`)[0];
    // Create n columns in grid
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < numberOfColumns; i++) {
        // Create a column
        const col = createEle('DIV', row);
        col.className = `col-${numberOfColumns / 12}`;

        // Give date heading
        const date = createEle('P', col);
        date.innerHTML = `${i + 1}/20`;
        date.style.textAlign = 'center';

        // Fill the column with UI

        // Player action buttons for each action players can make
        // eslint-disable-next-line no-restricted-syntax
        for (const action of listOfPlayerActions) {
            // Make an action button
            const btn = createEle('BUTTON', col, `turn${i}-${action.id}`);
            btn.className = `player-action m-2 btn btn-sm`;
            btn.style.height = 'auto';
            btn.style.width = '100%';
            btn.setAttribute('data-action', action.id);
            btn.style.position = 'relative';
            btn.innerHTML = `<i class="fa ${action.icon}"></i> <br> <span style='font-size: 0.75rem;'>${action.name}</span>`;
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
