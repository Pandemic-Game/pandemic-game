/* eslint-disable no-unused-vars */
import * as $ from 'jquery';
import { writeMessageToEventBox } from './eventsBox';
import { doc } from 'prettier';

/*
Research investment mechanic to unlock in-game advancements through research

    Arguments
    ---------
    research = list of properties for a research option,  (dictionary)
        structure of research (see allResearchOptions below) = {

            id: id of element on dom (string),
            name: button and event title (string),
            description: description of effects shown in event (string),
            function: effect on unlocking (function),
            unlocksFurtherResearch: name of any research option unlocked by completing this research (string),
            enabledAtStart: whether it is unlockable at start or requires a previous research (boolean),
            cost: research investment in days (int),

        }, 
*/

// Research mechanics (temporary, integrate into game engine)
function finishResearching(research){

    // Remove research choice
    $(`#${research.id}`).hide();

    // Notify player of unlock
    writeMessageToEventBox({
        name: `Research investment complete`,
        description: `
            <p>
                <strong class='text-success'> ${research.name} </strong> <br><br>
            </p>
            <p> 
                <strong> Effects: </strong> <br>
                <ul class="list-group">
                    <li class="list-group-item"> 
                        You can now ${research.description} 
                    </li>
                    <li class='list-group-item text-success' style='font-weight: 400'> 
                        ${research.unlocksFurtherResearch ? research.unlocksFurtherResearch + '<span class="text-dark"> unlocked </span>' : ''}
                    </li>
                </ul>
            </p>
        `,
        happensOnce: null,
        cssClass: null,
        canActivate: null
    });

    // Make research effect
    research.function();
}
function startResearching(research){

    // Style research
    $(`#${research.id}`)
        .removeClass('btn-success')
        .css('background-color', 'gold')
        .html(`${research.name} <br> Researching (10 days remaining) `);

    // Lock player out of completing any other research in this time
    $(`#${'advance-button'}`).one('click', function () {
        finishResearching(research);
    });
}

/* 

Function to create research options on the DOM
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
            function() {
                $('#intel-deaths').show(); // Show associated stats
                $('#intel-hospitalisations').show();
                $('#res-trackTrace').prop('disabled', false); // Unlock next research option
            },
            enabledAtStart: true,
            cost: 10,
            unlocksFurtherResearch: 'Start track and trace'
        },
        {
            id: 'res-trackTrace',
            name: 'Start track and trace',
            description: 'see how many cases of the disease there are',
            function() {
                $('#intel-cases').show();
                $('#res-modelling').prop('disabled', false); // Unlock next research option
            },
            enabledAtStart: false,
            cost: 10,
            unlocksFurtherResearch: 'Produce statistical models'
        },
        {
            id: 'res-modelling',
            name: 'Produce statistical models',
            description: 'see a graph of the current cases and economy',
            function() {
                $('#view-btn-graph-label').text('Graph');
                $('#view-btn-graph').prop('disabled', false);
            },
            enabledAtStart: false,
            cost: 10,
            unlocksFurtherResearch: null
        },
        {
            id: 'res-economicReports',
            name: 'Release economic reports',
            description: 'see the state of the economy and policy costs',
            function() {
                $('#intel-gdp').show();
            },
            enabledAtStart: true,
            cost: 10,
            unlocksFurtherResearch: null
        },
        {
            id: 'res-polling',
            name: 'Start polling the public',
            description: 'see how much the public supports you',
            function() {
                $('#intel-publicSupport').show();
                $('#res-leakToPress').prop('disabled', false);
            },
            enabledAtStart: true,
            cost: 10,
            unlocksFurtherResearch: 'Leak policies to the press'
        },
        {
            id: 'res-leakToPress',
            name: 'Leak policies to the press',
            description: 'see how your choices will affect the public opinion of you before you select them',
            function() {
                console.log('leaked policies to the press');
                // Show the public support effects of policies before you enact them
            },
            enabledAtStart: false,
            cost: 10,
            unlocksFurtherResearch: null
        }
    ]
) => {
    // Create research options for players on page
    // eslint-disable-next-line no-restricted-syntax
    for (const research of allResearchOptions) {

        // Build button for research option
        const btn = document.createElement('BUTTON');
        btn.innerHTML = research.name;
        btn.id = research.id;
        btn.className = 'm-1 btn btn-sm btn-success player-action';
        document.getElementById('player-research-container').appendChild(btn);

        // Enable / disable at start
        if (!research.enabledAtStart) {
            btn.disabled = true;
        }

        // Assign on-click function
        btn.onclick = function () {
            startResearching(research);
        };
    }
};
