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
import { buildCasesChart, updateCasesChart } from './LineChart.ts';
// Object that will keep track of the chart instance
let casesChart;
let lastMonthlyValues;

const updateCumulativeIndicators = (fullHistory) => {
    if (fullHistory.length === 0) {
        console.warn('History should not be empty. Indicators will not be renderer correctly');
    } else {
        const totalcases = fullHistory.reduce((acc, cur) => {
            return acc + cur.numInfected;
        }, 0);
        const totaldead = fullHistory.reduce((acc, cur) => {
            return acc + cur.numDead;
        }, 0);
        const totalcosts = fullHistory.reduce((acc, cur) => {
            return acc + cur.totalCost;
        }, 0);
        $(`#cases_this`).html(`${nFormatter(totalcases - fullHistory[0].numInfected, 1)}`);
        $(`#deaths_this`).html(`${nFormatter(totaldead - fullHistory[0].numDead, 0)}`);
        $(`#cost_this`).html(`$ ${nFormatter(totalcosts - fullHistory[0].totalCost, 1)}`);
    }
};

const updateGraphs = (history, hospitalCapacity) => {
    const fullYear = 365;
    const costHistory = [];
    const caseHistory = [];

    const visibleHistory = history.slice(13); // Hack to make thinks align well on screen

    visibleHistory.forEach((entry) => {
        const targetDate = new Date(Date.UTC(2021, 0, 1));
        targetDate.setDate(targetDate.getDate() + entry.days);
        costHistory.push({ x: targetDate, y: entry.totalCost });
        caseHistory.push({ x: targetDate, y: entry.numInfected });
    });
    const lastDay = visibleHistory.length > 0 ? visibleHistory[visibleHistory.length - 1].days + 1 : 1;

    for (let futureDay = lastDay; futureDay <= fullYear; futureDay += 1) {
        const targetDate = new Date(Date.UTC(2021, 0, 1));
        targetDate.setDate(targetDate.getDate() + futureDay);
        costHistory.push({ x: targetDate, y: null });
        caseHistory.push({ x: targetDate, y: null });
    }

    if (!casesChart) {
        casesChart = buildCasesChart('cases-graph', caseHistory, costHistory, hospitalCapacity);
    } else {
        updateCasesChart(casesChart, caseHistory, costHistory);
    }
};

const updateMonthlyIndicators = (turnNumber, monthHistory) => {
    const totalCases = monthHistory.reduce((acc, cur) => {
        return acc + cur.numInfected;
    }, 0);
    const totalDeaths = monthHistory.reduce((acc, cur) => {
        return acc + cur.numDead;
    }, 0);
    const totalCosts = monthHistory.reduce((acc, cur) => {
        return acc + cur.totalCost;
    }, 0);
	if(lastMonthlyValues){
		console.log(lastMonthlyValues,totalCases,totalDeaths,totalCosts,1.1*lastMonthlyValues.cases > totalCases,lastMonthlyValues.cases < 1.1*totalCases);
	}
	$(`#month-cases-${turnNumber}`).html(`${nFormatter(totalCases, 0)}`);
	if(lastMonthlyValues && (lastMonthlyValues.cases > 1.1*totalCases)){
		$(`#month-cases-${turnNumber}`)[0].style.color="#00A000";
		if(lastMonthlyValues.cases > 1.5*totalCases){
			$(`#middle-cases-${turnNumber-1}`).html("<span class='current-value extreme-negative'></span>");
		} else{
			$(`#middle-cases-${turnNumber-1}`).html("<span class='current-value negative'></span>");
		}
	} else if(lastMonthlyValues && (1.1*lastMonthlyValues.cases < totalCases)){
		$(`#month-cases-${turnNumber}`)[0].style.color="#C00000";
		if(1.5*lastMonthlyValues.cases < totalCases){
			$(`#middle-cases-${turnNumber-1}`).html("<span class='current-value extreme-positive'></span>");
		} else{
			$(`#middle-cases-${turnNumber-1}`).html("<span class='current-value positive'></span>");
		}
	} else{
		$(`#middle-cases-${turnNumber-1	}`).html("<span class='current-value'></span>");
	}
	$(`#month-deaths-${turnNumber}`).html(`${nFormatter(totalDeaths, 0)}`);
	if(lastMonthlyValues && (lastMonthlyValues.deaths > 1.1*totalDeaths)){
		$(`#month-deaths-${turnNumber}`)[0].style.color="#00A000";
		if(lastMonthlyValues.deaths > 1.5*totalDeaths){
			$(`#middle-deaths-${turnNumber-1}`).html("<span class='current-value extreme-negative'></span>");
		} else{
			$(`#middle-deaths-${turnNumber-1}`).html("<span class='current-value negative'></span>");
		}
	} else if(lastMonthlyValues && (1.1*lastMonthlyValues.deaths < totalDeaths)){
		$(`#month-deaths-${turnNumber}`)[0].style.color="#C00000";
		if(1.5*lastMonthlyValues.deaths < totalDeaths){
			$(`#middle-deaths-${turnNumber-1}`).html("<span class='current-value extreme-positive'></span>");
		} else{
			$(`#middle-deaths-${turnNumber-1}`).html("<span class='current-value positive'></span>");
		}
	} else{
		$(`#middle-deaths-${turnNumber-1	}`).html("<span class='current-value'></span>");
	}
	$(`#month-cost-${turnNumber}`).html(`${nFormatter(totalCosts, 1)}`);
	if(lastMonthlyValues && (lastMonthlyValues.cost > 1.1*totalCosts)){
		$(`#month-cost-${turnNumber}`)[0].style.color="#00A000";
		if(lastMonthlyValues.cost > 1.5*totalCosts){
			$(`#middle-cost-${turnNumber-1	}`).html("<span class='current-value extreme-negative'></span>");
		} else{
			$(`#middle-cost-${turnNumber-1	}`).html("<span class='current-value negative'></span>");
		}
	} else if(lastMonthlyValues && (1.1*lastMonthlyValues.cost < totalCosts)){
		$(`#month-cost-${turnNumber}`)[0].style.color="#C00000";
		
		if(1.5*lastMonthlyValues.cost < totalCosts){
			$(`#middle-cost-${turnNumber-1	}`).html("<span class='current-value extreme-positive'></span>");
		} else{
			$(`#middle-cost-${turnNumber-1	}`).html("<span class='current-value positive'></span>");
		}
	} else{
		$(`#middle-cost-${turnNumber-1	}`).html("<span class='current-value'></span>");
	}
	lastMonthlyValues = {
		"cases": totalCases,
		"deaths": totalDeaths,
		"cost": totalCosts,
	}
};

export const adjustIndicator = (turnNumber, animate) => {
    const columns = $('#player-actions-container tbody tr')[0].children;
    if (turnNumber < 12) {
        const position = columns[turnNumber + 1].getBoundingClientRect().left;
        if (animate) {
            $('#turn-indicator').animate({ left: `${position}px` });
        } else {
            $('#turn-indicator').offset({ left: position });
        }
    } else {
        $('#turn-indicator').addClass('d-none');
    }
};

/**
 * Updates all the on-screen indicators including graphs.
 * @param turnNumber - The number of the current turn
 * @param fullHistory - An array of Indicator, with the full game history
 * @param lastTurnHistory - An array with of Indicator with the results of the last turn
 * @param hospitalCapacity - Number of hospital capacity
 */
export const updateIndicators = (turnNumber, fullHistory, lastTurnHistory, hospitalCapacity) => {
    updateCumulativeIndicators(fullHistory);
    updateGraphs(fullHistory, hospitalCapacity);
    updateMonthlyIndicators(turnNumber, lastTurnHistory);
    adjustIndicator(turnNumber, true);
};

export const updatePreviousGameIndicators = (previousIndicators) => {
    const totalCasesFn = (monthHistory) =>
        monthHistory.reduce((acc, cur) => {
            return acc + cur.numInfected;
        }, 0);

    const totalDeathsFn = (monthHistory) =>
        monthHistory.reduce((acc, cur) => {
            return acc + cur.numDead;
        }, 0);
    const totalCostsFn = (monthHistory) =>
        monthHistory.reduce((acc, cur) => {
            return acc + cur.totalCost;
        }, 0);
		
	let totcasesSum = 0;
	let totdeathsSum = 0;
	let totcostSum = 0;
	
    previousIndicators.forEach((turn, i) => {
        const turnNumber = i + 1;
		const totcases = totalCasesFn(turn.history);
		const totdeaths = totalDeathsFn(turn.history);
		const totcost = totalCostsFn(turn.history);
		totcasesSum += totcases;
		totdeathsSum += totdeaths;
		totcostSum += totcost;
        $(`#last-game-month-cases-${turnNumber}`).html(`${nFormatter(totcases, 1)}`);
        $(`#last-game-month-deaths-${turnNumber}`).html(`${nFormatter(totdeaths, 0)}`);
        $(`#last-game-month-cost-${turnNumber}`).html(`${nFormatter(totcost, 1)}`);
    });
	
	$(`#cases_last`).html(`${nFormatter(totcasesSum)}`);
    $(`#deaths_last`).html(`${nFormatter(totdeathsSum)}`);
    $(`#cost_last`).html(`$ ${nFormatter(totcostSum)}`);
};

export const showWinScreen = (totalCost, totalCases, totalDeath, prevGames) => {
    $(`#win-total-cases`).html(nFormatter(totalCases, 1));
    $(`#win-total-dead`).html(nFormatter(totalDeath, 1));
    $(`#win-total-costs`).html(`$ ${nFormatter(totalCost, 1)}`);
    $('#win-screen').modal('show');

    const prevGamesContainer = $('#prev-games-container');
    if (prevGames.length > 0) {
        prevGamesContainer.removeClass('d-none');
        const costRow = $('#past-cost-row');
        const deadRow = $('#past-dead-row');
        const casesRow = $('#past-cases-row');
        prevGames.forEach((pastGame) => {
            casesRow.append(`<td>${nFormatter(pastGame.totalCases, 1)}</td>`);
            deadRow.append(`<td>${nFormatter(pastGame.totalDead, 1)}</td>`);
            costRow.append(`<td>$ ${nFormatter(pastGame.totalCost, 1)}</td>`);
        });
    } else {
        $('#first-game-message').removeClass('d-none');
    }
};

// Hide and disable all buttons
const resetControls = () => {
    // Disable and hide all choices
    $('.player-action')
        .prop('disabled', true) // Disable
        .attr('data-active', 'inactive') // Reset activation status
        .animate({ opacity: 0.1 }, 'slow') // Hide
        .addClass('btn-light') // Reset active styling
        .removeClass('btn-danger')
        .removeClass('btn-success');
};

export const setControlsToTurn = (playerTurn, dictOfActivePolicies, inGameEvents, initialContainmentPolicies) => {
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
    $(`[id^="turn${playerTurn}-"]`).each((_idx, domNode) => {
        // Enable and style by activation
        const target = $(domNode);
        const choiceIsActive = dictOfActivePolicies[target.data('action')];

        const choice = initialContainmentPolicies.find((it) => it.id === target.data('action'));
        // eslint-disable-next-line no-nested-ternary
        const label = choice ? (choiceIsActive ? choice.activeLabel : choice.inactiveLabel) : '';
        target
            .html(label)
            .removeClass('btn-light')
            .removeClass(choiceIsActive ? 'btn-light' : 'btn-success')
            .addClass(choiceIsActive ? 'btn-success' : 'btn-light') // Green = active, red = inactive
            .prop('disabled', false) // Enable
            .animate({ opacity: 1 }, 'slow'); // Show
    });

    // Style current action buttons
    $('.turn-btn-grp').hide();
    $(`#undo-btn-${playerTurn + 1}`).show();
    $(`#endTurn-btn-${playerTurn + 1}`).show();

    // Remove styles from future choices
    $(`[id^="turn${playerTurn + 1}-"]`)
        .prop('disabled', true) // Disable
        .removeClass('btn-light')
        .removeClass('btn-success')
        .animate({ opacity: 0.1 }, 'slow'); // Hide

    $(`[id^="month-deaths-${playerTurn + 1}"]`).html('-');
    $(`[id^="month-cases-${playerTurn + 1}"]`).html('-');
    $(`[id^="month-cost-${playerTurn + 1}"]`).html('-');

    $('#events-holder').html('');
    inGameEvents.forEach((evt) => {
        $('#events-holder').append(`<div class="${evt.cssClass}" data-event="${evt.name}">${evt.description}</div>`);
    });
};
