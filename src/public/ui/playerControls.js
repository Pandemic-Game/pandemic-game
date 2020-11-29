/*

Player controls
===============
Description:
Initialises and controls the game

Use:
Runs on startup, responds to player controls

*/


/* Initialise UI */

    // Initialise UI with list of player actions
    createGameUI(listOfPlayerActions, onPlayerSelectsAction, onEndTurn) // Action on btn press

    // Init game button display to turn 0
    setControlsToTurn(playerTurn);

    // Feed back to player their choices
    //showChoiceActivation(playerAction);


/* Await player input and then do these actions */


// On player choses action
function onPlayerSelectsAction(action){

    // Toggle action activation
    dictOfActivePolicies[action] = !dictOfActivePolicies[action];

}

// On end turn
function onEndTurn(){

    // Check for end game
    if(playerTurn===11){return onGameEnd()};

    // Else start a new turn

    /* 
        Make player actions on:
            - Model (This is where the simulation will be called and updated)
            - View (This is where the visualisation will be updated)
            - Controller (feedback chosen actions to player)
    */ 

    // Update model - 
        
        /* Bruno's simulation API controlled from here */

        // Advance player turn
        playerTurn++;

    // Update view

        /* Sascha's graph module goes here */

    // Update controller - 

        // Advance controls to current turn
        setControlsToTurn(playerTurn);


}

// End game
function onGameEnd(){

    alert('You finished the game.');

    // Reset model

        // Reset to turn 0
        playerTurn = 0;

        // Reset active policies
        dictOfActivePolicies = {
            travel: false,
            masks: false,
            schools: false,
            business: false,
        }

    // Reset view

    
    // Reset controls
    setControlsToTurn(0);
}