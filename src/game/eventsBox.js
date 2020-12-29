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

    // Show event dialog
    const modal = new bootstrap.Modal(document.getElementById('modal-event'));
    modal.show();

    // Send message to player event box
    document.getElementById('event-title').innerHTML = evt.name;
    document.getElementById('event-content').innerHTML = evt.description;

    // Give player action choices
    document.getElementById('event-responses').innerHTML = '';
    const btn = document.createElement('BUTTON');
    btn.innerHTML = 'Continue';
    btn.className = `btn btn-success`;
    btn.onclick = function(){modal.hide();}
    document.getElementById('event-responses').appendChild(btn);

    /* Deprecated functions for events as messages in chat log
    document.getElementById('events-box').innerHTML = '';
    const p = document.createElement('P');
    p.innerHTML = message;
    p.className = `speech-bubble-left mr-auto ${evt.cssClass}`;
    document.getElementById('events-box').appendChild(p);
    $('#events-box').animate({ scrollTop: $('#events-box')[0].scrollHeight }, 1000); */
};