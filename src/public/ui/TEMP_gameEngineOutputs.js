// TEMPORARY - Outputs from game engine used by view


// Integer player turn to set or reset the game controller
var playerTurn = 0;

// List of player actions used to make buttons
listOfPlayerActions = [
        {
            name: 'Ban travel',
            icon: '<i class="fas fa-car-side"></i>',
            id: 'travel',
        },
        {
            name: 'Enforce masks',
            icon: '<i class="fas fa-head-side-mask"></i>',
            id:  'masks',
        },
        {
            name: 'Close schools',
            icon: '<i class="fas fa-graduation-cap"></i>',
            id:  'schools',
        },
        {
            name: 'Close bars',
            icon: '<i class="fas fa-briefcase"></i>',
            id:  'business',
        }
    ]

// Dict of each player action
dictOfActivePolicies = {
    travel: false,
    masks: false,
    schools: false,
    business: false,
}