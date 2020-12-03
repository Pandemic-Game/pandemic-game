/*

setGameUI
=============
Description:
Sets the display of UI elements for the game 

Use:
Sets UI display given the player's in-game turn and actions

*/

import * as $ from 'jquery';
import { nFormatter } from '../lib/util';
import { buildCasesChart } from './LineChart.ts';
import { months} from '../lib/util';

// Hide and disable all buttons
export const resetControls = () => {
    // Disable and hide all choices
    $('.player-action')
        .prop('disabled', true) // Disable
        .attr('data-active', 'inactive') // Reset activation status
        .animate({ opacity: 0.1 }, 'slow') // Hide
        .addClass('btn-light') // Reset active styling
        .removeClass('btn-danger')
        .removeClass('btn-success');
};

export const setControlsToTurn = (playerTurn, dictOfActivePolicies) => {
    // If game initialised or reset re-init controls
    if (playerTurn === 0) {
        // Reset controls
        resetControls();

        // Else if game is in play
    } else {
        // Style previous choices
        $(`[id^="turn${playerTurn - 1}-"]`)
            .prop('disabled', true) // Disable
            .animate({ opacity: 0.5 }, 'slow'); // Hide
    }

    // Style current choices
    $(`[id^="turn${playerTurn}-"]`).each(function () {
        // Enable and style by activation
        const choiceIsActive = dictOfActivePolicies[$(this).attr('data-action')];

        $(this)
            .removeClass('btn-light')
            .removeClass(choiceIsActive ? 'btn-light' : 'btn-success')
            .addClass(choiceIsActive ? 'btn-success' : 'btn-light') // Green = active, red = inactive
            .prop('disabled', false) // Enable
            .animate({ opacity: 1 }, 'slow'); // Show
    });
};

export const updateIndicators = (indicators, history) => {
    $(`#cases-current`).html(nFormatter(indicators.numInfected, 1));
    $(`#deaths-current`).html(nFormatter(indicators.numDead, 1));
    $(`#cost-current`).html(nFormatter(indicators.totalCost, 1));

    const day = history.length;
    const month_idx = Math.floor(history.length / 30);
    $('#date-current').html(months[month_idx] + ' 1');
    
    console.log(indicators);
    console.log(history);
    const costHistory = history.map((it) => it.indicators.totalCost);
    costHistory.push(indicators.totalCost);
    while (costHistory.length < 12) {
        costHistory.push(null);
    }

    const caseHistory = history.map((it) => it.indicators.numInfected);
    caseHistory.push(indicators.numInfected);
    while (caseHistory.length < 12) {
        caseHistory.push(null);
    }

    const deathHistory = history.map((it) => it.indicators.numDead);
    deathHistory.push(indicators.numDead);
    while (deathHistory.length < 12) {
        deathHistory.push(null);
    }

    buildCasesChart('cases-graph', caseHistory, deathHistory, costHistory);
};

export const showWinScreen = (totalCost, totalCases) => {
    $(`#win-total-cases`).html(nFormatter(totalCases, 5));
    $(`#win-total-costs`).html(nFormatter(totalCost, 5));
    $('#win-screen').modal('show');
};
