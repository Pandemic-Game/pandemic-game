import { SimulatorState } from '../SimulatorState';
import { InGameEvent } from './InGameEvents';

export const LockdownFatigueEvent: InGameEvent = {
    name: 'Lockdown fatigue',
    description: `People are getting tired of lockdown. What is your response?`,
    happensOnce: false,
    cssClass: 'alert alert-primary',
    canActivate: (context: SimulatorState) => true, // IF lockdown measures are active
    choices: []
};

/*

    {
    label: 'Do nothing.',
    effects: '-1 Public support',
    function: function(){console.log('-1 Public support')}
    },
    {
    label: 'Lift lockdown.',
    effects: 'Lockdown measures lifted',
    function: function(){console.log('Lockdown measures lifted')}
    },

*/