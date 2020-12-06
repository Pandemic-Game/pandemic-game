/*

setGameUI
=============
Description:
Sets the display of UI elements for the game 

Use:
Sets UI display given the player's in-game turn and actions

*/

import * as $ from 'jquery';
import { nFormatter, months } from '../lib/util';
import { buildCasesChart, updateCasesChart } from './LineChart.ts';

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
    $(`[id^="turn${playerTurn}-"]`).each(function () {
        // Enable and style by activation
        const choiceIsActive = dictOfActivePolicies[$(this).attr('data-action')];

        let label = '';
        for(const choice of initialContainmentPolicies){
            if(choice.id === $(this).attr('data-action')){
                if(choiceIsActive){
                    label = choice.activeLabel;
                }else{
                    label = choice.inactiveLabel;
                }
            }
        }

        $(this)
            .html(label)
            .removeClass('btn-light')
            .removeClass(choiceIsActive ? 'btn-light' : 'btn-success')
            .addClass(choiceIsActive ? 'btn-success' : 'btn-light') // Green = active, red = inactive
            .prop('disabled', false) // Enable
            .animate({ opacity: 1 }, 'slow'); // Show
    });

    // Remove styles from future choices
    $(`[id^="turn${playerTurn + 1}-"]`)
        .prop('disabled', true) // Disable
        .removeClass('btn-light')
        .removeClass('btn-success')
        .animate({ opacity: 0.1 }, 'slow'); // Hide

    $('#events-holder').html('');
    inGameEvents.forEach((evt) => {
        $('#events-holder').append(`<div class="${evt.cssClass}" data-event="${evt.name}">${evt.description}</div>`);
    });
};

const setChangeValues = (newValue, oldValue, totalValue, diffElm, grothElm, currentElm, totalElm) => {
    totalElm.html(totalValue);
	if (newValue > oldValue) {
        diffElm
            .removeClass('negative')
            .addClass('positive')
            .html(`+${nFormatter(newValue - oldValue)}`);
        grothElm
            .removeClass('negative')
            .addClass('positive')
            .html(oldValue === 0 ? '' : `+${Math.floor((1000 * (newValue - oldValue)) / oldValue / 10)}%`);
        currentElm.removeClass('negative').addClass('positive');
    } else if (newValue < oldValue) {
        diffElm
            .removeClass('positive')
            .addClass('negative')
            .html(nFormatter(newValue - oldValue));
        grothElm
            .removeClass('positive')
            .addClass('negative')
            .html(`${Math.floor((1000 * (newValue - oldValue)) / oldValue / 10)}%`);
        currentElm.removeClass('positive').addClass('negative');
    } else {
        diffElm.removeClass('positive negative').html('0');
        grothElm.removeClass('positive negative').html('0%');
        currentElm.removeClass('positive negative');
    }
};

let casesChart;

export const updateIndicators = (history) => {
    if (history.length === 0) {
        console.warn('History should not be empty. Indicators will not be renderer correctly');
    } else {
        const lastHistoryEntry = history[history.length - 1];
        $(`#cases-current`).html(nFormatter(lastHistoryEntry.numInfected, 1));
        $(`#deaths-current`).html(nFormatter(lastHistoryEntry.numDead, 0));
        $(`#cost-current`).html(`$ ${nFormatter(lastHistoryEntry.totalCost, 1)}`);

        if (history.length >= 31) {
            const oldIndicators = history[history.length - 31];
			
			let totalcases = history.reduce((acc,cur)=>{return acc+cur.numInfected},0);
			let totaldeaths = history.reduce((acc,cur)=>{return acc+cur.numDead},0);
			let totalcosts = history.reduce((acc,cur)=>{return acc+cur.totalCost},0);
		
            setChangeValues(
                lastHistoryEntry.numInfected,
                oldIndicators.numInfected,
				nFormatter(totalcases),
                $(`#cases-differeces`),
                $(`#cases-growth`),
                $(`#cases-current`),
				$(`#cases-total`)
            );
            setChangeValues(
                lastHistoryEntry.numDead,
                oldIndicators.numDead,
				nFormatter(totaldeaths),
                $(`#deaths-differeces`),
                $(`#deaths-growth`),
                $(`#deaths-current`),
				$(`#deaths-total`)
            );
            setChangeValues(
                lastHistoryEntry.totalCost,
                oldIndicators.totalCost,
				nFormatter(totalcosts),
                $(`#cost-differeces`),
                $(`#cost-growth`),
                $(`#cost-current`),
				$(`#cost-total`)
            );
        } else{
			$(`#cases-total`).html(nFormatter(indicators.numInfected, 1));
			$(`#deaths-total`).html(nFormatter(indicators.numDead, 0));
			$(`#cost-total`).html("$ "+nFormatter(indicators.totalCost, 1));
		}

        const monthIdx = Math.floor(history.length / 30) % months.length;
        $('#date-current').html(`${months[monthIdx].name} 1`);
    }

    const fullYear = 365;
    const costHistory = [];
    const caseHistory = [];
    history.forEach((entry) => {
        const targetDate = new Date(Date.UTC(2020, 0, 1));
        targetDate.setDate(targetDate.getDate() + entry.days);
        costHistory.push({ x: targetDate, y: entry.totalCost });
        caseHistory.push({ x: targetDate, y: entry.numInfected });
    });

    const lastDay = history.length > 0 ? history[history.length - 1].days + 1 : 1;
    // eslint-disable-next-line no-plusplus
    for (let futureDay = lastDay; futureDay <= fullYear; futureDay++) {
        const targetDate = new Date(Date.UTC(2020, 0, 1));
        targetDate.setDate(targetDate.getDate() + futureDay);
        costHistory.push({ x: targetDate, y: null });
        caseHistory.push({ x: targetDate, y: null });
    }

    if (!casesChart) {
        casesChart = buildCasesChart('cases-graph', caseHistory, costHistory);
    } else {
        updateCasesChart(casesChart, caseHistory, costHistory);
    }
};

export const showWinScreen = (totalCost, totalCases) => {
    $(`#win-total-cases`).html(nFormatter(totalCases, 1));
    $(`#win-total-costs`).html(`$ ${nFormatter(totalCost, 1)}`);
    $('#win-screen').modal('show');
};
