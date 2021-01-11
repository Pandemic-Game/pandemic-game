import { SimulatorState } from '../SimulatorState';
import { InGameEvent } from './InGameEvents';

export const VaccinationEvent1: InGameEvent = {
    name: 'The Vaccine (I)',
    description: `A vaccine has been developed and is starting to be circulated. What is your response?`,
    happensOnce: true,
    cssClass: 'alert alert-primary',
    canActivate: (context: SimulatorState) => true,
    choices: []
};

/*

        {
        label: 'Do nothing.',
        function: function(){console.log('Vaccine circulated')}
        },
        {
        label: 'Ban it.',
        function: function(){console.log('Vaccine banned')}
        },
*/
