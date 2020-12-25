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

const updateGraphs = (history) => {
    const fullYear = 365;
    const costHistory = [];
    const caseHistory = [];
    const hospitalHistory = [];
    history.forEach((entry) => {
        const targetDate = new Date(Date.UTC(2020, 0, 1));
        targetDate.setDate(targetDate.getDate() + entry.days);
        caseHistory.push({ x: targetDate, y: entry.numInfected });
        hospitalHistory.push({ x: targetDate, y: entry.numHospitalized });
    });
    const lastDay = history.length > 0 ? history[history.length - 1].days + 1 : 1;

    for (let futureDay = lastDay; futureDay <= fullYear; futureDay += 1) {
        const targetDate = new Date(Date.UTC(2020, 0, 1));
        targetDate.setDate(targetDate.getDate() + futureDay);
        caseHistory.push({ x: targetDate, y: null });
        hospitalHistory.push({ x: targetDate, y: null });
    }

    if (!casesChart) {
        casesChart = buildCasesChart('cases-graph', caseHistory, hospitalHistory, history[history.length - 1].hospitalCapacity);
    } else {
        updateCasesChart(casesChart, caseHistory, hospitalHistory);
    }
};

const updateIndicatorPanel = (turnNumber, monthHistory) => {
    $('#turn').html(nFormatter(turnNumber,0));
    $(`#date`).html(nFormatter(monthHistory.days, 0));
    $(`#deaths-month`).html(nFormatter(monthHistory.numDead, 0));
    $(`#cases-hospitalized`).html(nFormatter(monthHistory.numHospitalized, 0));
    $(`#gdp`).html(nFormatter(monthHistory.GDP, 0));
    //$(`#public-support`).html(nFormatter(monthHistory., 0));
    $(`#hospital-capacity`).html(nFormatter(monthHistory.hospitalCapacity, 0));
    // $(`#test-capacity`).html(nFormatter(monthHistory., 0));
    // $(`#positively-tested`).html(nFormatter(monthHistory., 0));
    // $(`#tracing-capacity`).html(nFormatter(monthHistory., 0));
    // $(`#isolated-cases`).html(nFormatter(monthHistory., 0));
}

/**
 * Updates all the on-screen indicators including graphs.
 * @param turnNumber - The number of the current turn
 * @param fullHistory - An array of Indicator, with the full game history
 * @param lastTurnHistory - An array with of Indicator with the results of the last turn
 * @param hospitalCapacity - Number of hospital capacity
 */
export const updateIndicators = (turnNumber, fullHistory, lastTurnHistory) => {
    updateIndicatorPanel(turnNumber,fullHistory[fullHistory.length-1]);
    updateGraphs(fullHistory);

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
       //resetControls();

    }
    // Style current choices
    $(`[id^=""]`).each((_idx, domNode) => {
        // Enable and style by activation
        const target = $(domNode);
        const choiceIsActive = dictOfActivePolicies[target.data('action')];

        const choice = initialContainmentPolicies.find((it) => it.id === target.data('action'));
        // eslint-disable-next-line no-nested-ternary
        const label = choice ? (choiceIsActive ? choice.activeLabel : choice.inactiveLabel) : '';
        target
            .html(label)
            .removeClass(choiceIsActive ? 'player-action-inactive' : 'player-action-active')
            .addClass(choiceIsActive ? 'player-action-active' : 'player-action-inactive') // style active choices in style.css
            .prop('disabled', false) // Enable
            .animate({ opacity: 1 }, 'slow'); // Show
    });
    
    // Add message for each event
    inGameEvents.forEach((evt) => {

        // Compose message
        let message = `
            <em class='text-muted'>$date</em>
            <p><strong>${evt.name}</strong><br></p>
            ${evt.description}
        `

        // Send message to player event box
        let p = document.createElement('P');
        p.innerHTML = message;
        p.className = `speech-bubble-left mr-auto ${evt.cssClass}`;
        document.getElementById('events-box').appendChild(p);
    
        // Scroll down to message
        $("#events-box").animate({ scrollTop: $("#events-box")[0].scrollHeight }, 1000);
    });
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
            deadRow.append(`<td>${nFormatter(pastGame.totalDead, 1)}</td>`)
            costRow.append(`<td>$ ${nFormatter(pastGame.totalCost, 1)}</td>`);
        });
    } else {
        $('#first-game-message').removeClass('d-none');
    }
};

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
        $(`#cases-total`).html(nFormatter(totalcases - fullHistory[0].numInfected, 1));
        //$(`#deaths-total`).html(nFormatter(totaldead - fullHistory[0].numDead, 0));
        $(`#cost-total`).html(`$ ${nFormatter(totalcosts - fullHistory[0].totalCost, 1)}`);
    }
};

export const adjustIndicator = (turnNumber,animate) => {
    const basePosition = document.getElementsByClassName('container-fluid')[0].getBoundingClientRect().left;
    if (turnNumber < 12) {
        /* const monthPositions = [
            '405px',
            '496px',
            '584px',
            '675px',
            '764px',
            '858px',
            '948px',
            '1043px',
            '1136px',
            '1228px',
            '1320px',
            '1411px'
        ]; */
        /*const monthPositions = [
            `${basePosition + 165}px`,
            `${basePosition + 256}px`,
            `${basePosition + 344}px`,
            `${basePosition + 435}px`,
            `${basePosition + 525}px`,
            `${basePosition + 618}px`,
            `${basePosition + 708}px`,
            `${basePosition + 803}px`,
            `${basePosition + 896}px`,
            `${basePosition + 988}px`,
            `${basePosition + 1080}px`,
            `${basePosition + 1171}px`
        ]*/;
		const monthPositions = [
            basePosition + 165,
            basePosition + 256,
            basePosition + 344,
            basePosition + 435,
            basePosition + 525,
            basePosition + 618,
            basePosition + 708,
            basePosition + 803,
            basePosition + 896,
            basePosition + 988,
            basePosition + 1080,
            basePosition + 1171
        ]
        const position = `${monthPositions[turnNumber % monthPositions.length]}px`;
		if(animate){
			$('#turn-indicator').animate({ left: position });
		} else{
			$('#turn-indicator').offset({ left: monthPositions[turnNumber % monthPositions.length]});
		}
    } else {
        $('#turn-indicator').addClass('d-none');
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
    $(`#month-cases-${turnNumber}`).html(`${nFormatter(totalCases, 1)}`);
    $(`#month-deaths-${turnNumber}`).html(`${nFormatter(totalDeaths, 0)}`);
    $(`#month-cost-${turnNumber}`).html(`${nFormatter(totalCosts, 1)}`);
    
};

