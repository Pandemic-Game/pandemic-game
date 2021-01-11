/*

Events box / Player messages
---------------

    Writes messages to the player events box

    Arguments
    ---------
        evt: in game event defined by structure in simulator/in-game-events (dictionary)
            
            Structure of evt (e.g., as in InGameEvents.ts):
            {
                name: string;
                description: string;
                happensOnce: boolean;
                cssClass: string;
                canActivate: (context: SimulatorState) => boolean;
            }

*/

import * as $ from 'jquery';
import * as bootstrap from 'bootstrap';

export const writeMessageToEventBox = (evt) => {

    // Reset content
    document.getElementById('event-content').innerHTML = '';

    // Show event dialog
    $('#modal-event').modal('show');

    // Send message to player event box
    document.getElementById('event-title').innerHTML = evt.name;
    document.getElementById('event-content').innerHTML = evt.description;

    // Give player action choices
    document.getElementById('event-responses').innerHTML = '';

    for(const choice of evt.choices){

        const btn = document.createElement('BUTTON');
        btn.innerHTML = choice.label;
        btn.className = `btn btn-success`;
        btn.onclick = function () {
            choice.function();
            $('#modal-event').modal('hide');
        };
        document.getElementById('event-responses').appendChild(btn);
    }
};

export const writeMessageToMessageBox = (evt) => {
    console.log(`${evt.name} happened`);

    // Send message in chat log
    const p = document.createElement('P');
    p.innerHTML = evt.description;
    p.className = `speech-bubble-left mr-auto ${evt.cssClass}`;
    document.getElementById('events-box').appendChild(p);
    $('#events-box').animate({ scrollTop: $('#events-box')[0].scrollHeight }, 1000);
};
