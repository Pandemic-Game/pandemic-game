/* eslint-disable no-unused-vars */
import * as $ from 'jquery';
import { LinePlot } from '../lib/LinePlot';
import { nFormatter } from '../lib/util';
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

const createGraphPlaceholder = (parentEle, id) => {
    return createEle('DIV', parentEle, id);
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
    // Create container
    const container = createEle('DIV', document.body); // on = document.body
    container.className = 'p-5 d-flex flex-column';

    // Create title
    const title = createEle('H1', container); // on = container
    title.innerHTML = 'Pandemic simulator';

    // Create SVGs for graphs
    const casesGraphTitle = createEle('H5', container); // on = container
    casesGraphTitle.innerHTML = 'COVID-19 cases';
    casesGraphTitle.className = 'p-2';
    const casesCurrent = createEle('P', container); // on = container
    casesCurrent.className = 'p-2';
    casesCurrent.id = 'cases-current';
	createGraphPlaceholder(container, 'cases-graph');
	const caseModel ={
		"scalable":true,
		"width":"100%",
		"height":"200px",
		"backgroundColor":"#E0E0E0",
		"x_axis":{"name":"","line":"dot","lineColor":"#A0A0A0","min":0,"max":12,"step":12,"intervall":true,"formatter":(value => (value+1)+"/20")},
		"y_axis":{"name":"","line":"solid","lineColor":"#000000","min":0,"max":250000,"formatter":(value => nFormatter(value,1))},
		"lines":[{"name":"cases","color":"#000000","width":3}]
	};
	const casePlot = new LinePlot('cases-graph',caseModel);

    const costGraphTitle = createEle('H5', container); // on = container
    costGraphTitle.innerHTML = 'Cost per day';
    costGraphTitle.className = 'p-2';
    const costCurrent = createEle('P', container); // on = container
    costCurrent.className = 'p-2';
    costCurrent.id = 'cost-current';
    createGraphPlaceholder(container, 'cost-graph');
	const costModel ={
		"scalable":true,
		"width":"100%",
		"height":"200px",
		"backgroundColor":"#E0E0E0",
		"x_axis":{"name":"","line":"dot","lineColor":"#A0A0A0","min":0,"max":12,"step":12,"intervall":true,"formatter":(value => (value+1)+"/20")},
		"y_axis":{"name":"","line":"solid","lineColor":"#000000","min":0,"max":2500000000000,"formatter":(value => nFormatter(value,1))},
		"lines":[{"name":"costs","color":"#000000","width":3}]
	};
	const costPlot = new LinePlot('cost-graph',costModel);

    // Create row
    const rowTitle = createEle('H5', container); // on = container
    rowTitle.innerHTML = 'Lockdown policies';
    rowTitle.className = 'p-2';
    const row = createEle('DIV', container);
    row.className = 'row';

    // Create n columns in grid
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < numberOfColumns; i++) {
        // Create a column
        const col = createEle('DIV', row);
        col.className = `col-${numberOfColumns / 12}`;

        // Give dates as heading for each column
        const dateDiv = createEle('DIV', col)
        dateDiv.className = 'pl-3 w-100 d-flex flex-row justify-content-center';
        const date = createEle('P', dateDiv);
        date.innerHTML = `${i + 1}/20`;

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
            btn.innerHTML = `<i class="fa ${action.icon} noselect"></i> <br> <span style='font-size: 0.75rem' class='noselect'>${action.name}</span>`;
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

    // End turn button
    const endTurnBtn = createEle('BUTTON', container, `end-turn`);
    endTurnBtn.className = `w-100 m-2 btn btn-lg btn-secondary`;
    endTurnBtn.innerHTML = `Click to simulate policy for the month <i class="fas fa-arrow-right"></i>`;
    endTurnBtn.onclick = () => {
        // Call back to event on player making action
        onEndTurn();
    };
    $(`#restart-btn`).on('click', () => {
        onRestart();
    });
    // to use the line plots to update
    return {"casePlot":casePlot,"costPlot":costPlot};
};