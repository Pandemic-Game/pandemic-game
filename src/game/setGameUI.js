/*

setGameUI
=============
Description:
Sets the display of UI elements for the game 

Use:
Sets UI display given the player's in-game turn and actions

*/

import * as $ from 'jquery';
import * as d3 from 'd3';
import { nFormatter } from '../lib/util';
import { writeMessageToEventBox } from './eventsBox';
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

    // Show indicator values to player
    $(`#date`).html(nFormatter(monthHistory.days, 0)); // Date
    $(`#gdp`).html(nFormatter(monthHistory.GDP, 0)); // Economy
    $(`#deaths-month`).html(nFormatter(monthHistory.numDead, 0)); // Healthcare
    $(`#cases-hospitalized`).html(nFormatter(monthHistory.numHospitalized, 0));
    $(`#hospital-capacity`).html(nFormatter(monthHistory.hospitalCapacity, 0));
    $(`#public-support`).html(nFormatter(monthHistory.publicSupport, 0)); // Electability
    $(`#business-support`).html(nFormatter(monthHistory.businessSupport, 0));
    $(`#healthcare-support`).html(nFormatter(monthHistory.healthcareSupport, 0));
    // $(`#test-capacity`).html(nFormatter(monthHistory., 0)); // Not yet implemented
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
        writeMessageToEventBox(evt);
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

export const showLoseScreen = (totalCost, totalCases, totalDeath, prevGames, electability) => {

    // Show electability
    $('#lose-electability').html(electability);
    $('#view-electability').clone(true).prependTo('#lose-electability-pie');

    // Show current game stats
    $(`#lose-total-cases`).html(nFormatter(totalCases, 1));
    $(`#lose-total-dead`).html(nFormatter(totalDeath, 1));
    $(`#lose-total-costs`).html(`$ ${nFormatter(totalCost, 1)}`);
    $('#lose-screen').modal('show');

    // Show previous game stats
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

    // Electability indicator
    /*
        NOTE: PLACEHOLDER NUMBERS BELOW (20,30,40)
        Integrate into game engine to dynamically get these values as: 
            - monthHistory.publicSupport
            - monthHistory.businessSupport
            - monthHistory.healthcareSupport
    */
    $(`#score-electability`).html(calculateElectability(20, 30, 40));

    // Other indicators
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

export const setElectabilityPie = (electability) => {

    // Convert electability stats to list of pie data
    const data = [
        electability.publicSupport,
        electability.businessSupport,
        electability.healthcareSupport,
        electability.maxSupporters -
            electability.publicSupport -
            electability.businessSupport -
            electability.healthcareSupport
    ];

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
};