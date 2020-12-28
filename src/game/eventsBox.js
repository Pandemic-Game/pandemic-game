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

export const writeMessageToEventBox = (evt) => {

    // Compose message
    const message = `
        <p><strong>${evt.name}</strong><br></p>
        ${evt.description}
    `;

    // Send message to player event box
    const p = document.createElement('P');
    p.innerHTML = message;
    p.className = `speech-bubble-left mr-auto ${evt.cssClass}`;
    document.getElementById('events-box').appendChild(p);

    // Scroll down to message
    $('#events-box').animate({ scrollTop: $('#events-box')[0].scrollHeight }, 1000);
};