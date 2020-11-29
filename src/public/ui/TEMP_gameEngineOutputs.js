import { setControlsToTurn } from './setGameUI';

// TEMPORARY - Outputs from game engine used by view

// Integer player turn to set or reset the game controller
let playerTurn = 0;

// List of player actions used to make buttons
export const listOfPlayerActions = [
    {
        name: 'Ban travel',
        icon: '<i class="fas fa-car-side"></i>',
        id: 'travel'
    },
    {
        name: 'Enforce masks',
        icon: '<i class="fas fa-head-side-mask"></i>',
        id: 'masks'
    },
    {
        name: 'Close schools',
        icon: '<i class="fas fa-graduation-cap"></i>',
        id: 'schools'
    },
    {
        name: 'Close bars',
        icon: '<i class="fas fa-briefcase"></i>',
        id: 'business'
    }
];

// Dict of each player action
let dictOfActivePolicies = {
    travel: false,
    masks: false,
    schools: false,
    business: false
};

export const onPlayerSelectsAction = (action) => {
    // Toggle action activation
    dictOfActivePolicies[action] = !dictOfActivePolicies[action];
};

export const onGameEnd = () => {
    alert('You finished the game.');

    // Reset model

    // Reset to turn 0
    playerTurn = 0;

    // Reset active policies
    dictOfActivePolicies = {
        travel: false,
        masks: false,
        schools: false,
        business: false
    };

    // Reset view

    // Reset controls
    setControlsToTurn(0, dictOfActivePolicies);
};

// On end turn
export const onEndTurn = () => {
    // Check for end game
    if (playerTurn === 11) {
        return onGameEnd();
    }

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
    playerTurn += 1;

    // Update view

    /* Sascha's graph module goes here */

    // Update controller -

    // Advance controls to current turn
    setControlsToTurn(playerTurn, dictOfActivePolicies);
};
