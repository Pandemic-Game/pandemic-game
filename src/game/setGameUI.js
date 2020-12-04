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

export const setControlsToTurn = (playerTurn, dictOfActivePolicies, gameUI) => {
    console.log("setControlsToTurn");
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

const setChangeValues = (newValue, oldValue, diffElm, grothElm, currentElm) => {
	if(newValue > oldValue){
		diffElm
			.removeClass("negative")
			.addClass("positive")
			.html("+"+nFormatter(newValue-oldValue));
		grothElm
			.removeClass("negative")
			.addClass("positive")
			.html(oldValue == 0 ? "" : "+"+(Math.floor(1000*(newValue-oldValue)/oldValue/10))+"%");
		currentElm
			.removeClass("negative")
			.addClass("positive");
	} else if(newValue < oldValue){
		diffElm
			.removeClass("positive")
			.addClass("negative")
			.html(nFormatter(newValue-oldValue));
		grothElm
			.removeClass("positive")
			.addClass("negative")
			.html((Math.floor(1000*(newValue-oldValue)/oldValue/10))+"%");
		currentElm
			.removeClass("positive")
			.addClass("negative");
	} else{
		diffElm
			.removeClass("positive negative")
			.html("0");
		grothElm
			.removeClass("positive negative")
			.html("0%");
		currentElm
			.removeClass("positive negative")
	}
};

export const updateIndicators = (indicators, history) => {
	
	$(`#cases-current`).html(nFormatter(indicators.numInfected, 1));
    $(`#deaths-current`).html(nFormatter(indicators.numDead, 0));
    $(`#cost-current`).html('$' + nFormatter(indicators.totalCost, 1));
	if(history.length >= 30){
		let oldIndicators = history[history.length-30].indicators;
		setChangeValues(indicators.numInfected,oldIndicators.numInfected,$(`#cases-differeces`),$(`#cases-growth`),$(`#cases-current`));
		setChangeValues(indicators.numDead,oldIndicators.numDead,$(`#deaths-differeces`),$(`#deaths-growth`),$(`#deaths-current`));
		setChangeValues(indicators.totalCost,oldIndicators.totalCost,$(`#cost-differeces`),$(`#cost-growth`),$(`#cost-current`));
	}
	

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
    $(`#win-total-cases`).html(nFormatter(totalCases, 1));
    $(`#win-total-costs`).html('$' + nFormatter(totalCost, 1));
    $('#win-screen').modal('show');
};
