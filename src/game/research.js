/* eslint-disable no-unused-vars */
import * as $ from 'jquery';
import { writeMessageToEventBox } from './eventsBox';
import { doc } from 'prettier';

/* 

Function to create and handle research options on the DOM
----
    
    Arguments: researchOptions = list of research options for players
        {
            id: id of the button to select this research option (string),
            name: name of research option (string),
            description: description of what the research does (string),
            function: onclick function on player choosing research option (function),
            enabledAtStart: whether this research option is enabled at the start of the game (boolean),
            cost: cost of investment in months (number),
        }
    Run: This is called on startup by createGameUI

*/

export const initialisePlayerResearch = (

    /* List of research options available to players */
    allResearchOptions = [
        {
            id: 'res-healthRecords',
            name: 'Release national health records',
            description: 'see how many hospitalisations and deaths the disease is causing',
            function: function(){
                $('#intel-deaths').show(); // Show associated stats
                $('#intel-hospitalisations').show();
                $('#res-trackTrace').prop('disabled', false); // Unlock next research option
            },
            enabledAtStart: true,
            cost: 1,
        },
        {
            id: 'res-trackTrace',
            name: 'Start track and trace',
            description: 'see how many cases of the disease there are',
            function: function(){
                $('#intel-cases').show();
                $('#res-modelling').prop('disabled', false); // Unlock next research option
            },
            enabledAtStart: false,
            cost: 2,
        },
        {
            id: 'res-modelling',
            name: 'Produce statistical models',
            description: 'see a graph of the current cases and economy',
            function: function(){
                $('#cases-graph').show();
                $('#cases-graph-label').show();
            },
            enabledAtStart: false,
            cost: 1,
        },
        {
            id: 'res-economicReports',
            name: 'Release economic reports',
            description: 'see the state of the economy and policy costs',
            function: function(){
                $('#intel-gdp').show();
            },
            enabledAtStart: true,
            cost: 1,
        },
        {
            id: 'res-polling',
            name: 'Start polling the public',
            description: 'see how much the public supports you',
            function: function(){
                $('#intel-publicSupport').show();
                $('#res-leakToPress').prop('disabled', false);
            },
            enabledAtStart: true,
            cost: 1,
        },
        {
            id: 'res-leakToPress',
            name: 'Leak policies to the press',
            description: 'see how your choices will affect the public opinion of you before you select them',
            function: function(){
                console.log('leaked policies to the press')
                // Show the public support effects of policies before you enact them
            },
            enabledAtStart: false,
            cost: 2,
        },
    ]

) => {

    // Create research options for players on page
    // eslint-disable-next-line no-restricted-syntax
    for (const research of allResearchOptions) {

        // Build button for research option
        const btn = document.createElement('BUTTON');
        btn.innerHTML = research.name;
        btn.id = research.id;
        btn.className = 'm-1 btn btn-sm btn-success';
        document.getElementById('player-research-container').appendChild(btn);

        // Enable / disable at start
        if (!research.enabledAtStart) {
            btn.disabled = true;
        }

        // Assign on-click function
        btn.onclick = function(){

            // Remove choice from screen
            $(btn).hide();

            // Notify player of unlock
            writeMessageToEventBox({
                name: `Research investment complete: ${research.name}`,
                description: `You unlocked the ability to ${research.description}`,
                happensOnce: null,
                cssClass: null,
                canActivate: null,
            });

            // Make research effects
            research.function();
        }
    }

}