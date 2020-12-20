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
        $(`#deaths-total`).html(nFormatter(totaldead - fullHistory[0].numDead, 0));
        $(`#cost-total`).html(`$ ${nFormatter(totalcosts - fullHistory[0].totalCost, 1)}`);
    }
};

const updateGraphs = (history, hospitalCapacity) => {
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

    for (let futureDay = lastDay; futureDay <= fullYear; futureDay += 1) {
        const targetDate = new Date(Date.UTC(2020, 0, 1));
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
    $(`#month-cases-${turnNumber}`).html(`${nFormatter(totalCases, 1)}`);
    $(`#month-deaths-${turnNumber}`).html(`${nFormatter(totalDeaths, 0)}`);
    $(`#month-cost-${turnNumber}`).html(`${nFormatter(totalCosts, 1)}`);
};

export const adjustIndicator = (turnNumber, animate) => {
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
        ]*/ const monthPositions = [
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
        ];
        const position = `${monthPositions[turnNumber % monthPositions.length]}px`;
        if (animate) {
            $('#turn-indicator').animate({ left: position });
        } else {
            $('#turn-indicator').offset({ left: monthPositions[turnNumber % monthPositions.length] });
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
