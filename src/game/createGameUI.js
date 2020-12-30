/* eslint-disable no-unused-vars */
import * as $ from 'jquery';
import 'bootstrap/js/dist/modal';
import { initialisePlayerResearch } from './research';
import { doc } from 'prettier';
import * as d3 from 'd3';

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
Function to create D3 pie chart

    Arguments
    --------
    data = list of values to display in pie (array)
        data structure:
            [
                public support (int),
                business support (int),
                healthcare support (int)
            ]
*/

function createElectabilityPie(data) {

    // Create SVG canvas
    const svg = d3.select('#svg-pie');
    svg.attr('viewBox', '0 0 200 200');

    const g = svg.append('g').attr('transform', 'translate(100,100)'); // Create pie element in center

    // Creating Pie generator
    const pie = d3.pie();
    pie.sort(null); // Disable sorting by size for consistent view

    // Creating arc
    const arc = d3.arc().innerRadius(40).outerRadius(100); // Size of pie

    // Grouping different arcs
    const arcs = g.selectAll('arc').data(pie(data)).enter().append('g');

    // Appending path
    arcs.append('path')
        .attr('fill', (data, i) => {
            return [['#7bcecc', '#774779', '#ef4f4f', 'ghostwhite'][i]];
        })
        .attr('d', arc);
    
    // Text labels
    arcs.append('text')
        .attr("transform", function(d) {
        var _d = arc.centroid(d);
            return "translate(" + _d + ")";
        })
        .attr('stroke', 'black')
        .attr('text-anchor', 'middle')
        .text((d) => d.data);
}

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
    electability
) => {

    /* Create buttons */

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

    // View control button event handlers for home screen
    $(`#view-btn-electability`).on('click', () => {
        $(`#view-electability`).show();
        $(`#view-graph`).hide();
        $(`#view-stats`).hide();
    });
    $(`#view-btn-graph`).on('click', () => {
        $(`#view-electability`).hide();
        $(`#view-graph`).show();
        $(`#view-stats`).hide();
    });
    $(`#view-btn-stats`).on('click', () => {
        $(`#view-electability`).hide();
        $(`#view-graph`).hide();
        $(`#view-stats`).show();
    });
    
    // Player controls panel button event handlers for home screen
    $(`#controls-btn-policies`).on('click', () => {
        $(`#controls-policies`).show();
        $(`#controls-research`).hide();
    });
    $(`#controls-btn-research`).on('click', () => {
        $(`#controls-policies`).hide();
        $(`#controls-research`).show();
    });

    /* Create research */
    initialisePlayerResearch(); // research.js

    /* Create electability view pie chart */
    createElectabilityPie(electability);

    /* Create player actions */

    // Create buttons container
    const tableRoot = $(`#player-actions-container`)[0];

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
        btn.setAttribute('data-action', action.id);
        btn.setAttribute('data-inactiveLabel', `${action.inactiveLabel} ${action.name}`);
        btn.setAttribute('data-activeLabel', `${action.activeLabel} ${action.name}`);
        btn.innerHTML = `${action.inactiveLabel} ${action.name}`;
        btn.onclick = btnClickHandler;

    }
};