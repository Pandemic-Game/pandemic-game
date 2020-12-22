import { SimulatorState } from '../SimulatorState';
import { InGameEvent } from './InGameEvents';

export const WelcomeEvent: InGameEvent = {
    name: 'Welcome event',
    description: `Welcome !!! <br>
    I am G. Master, your personal assistant, here to help you controlling the Covid crisis. <br>`,
    happensOnce: false,
    cssClass: 'alert alert-primary',
    canActivate: (context: SimulatorState) => {
        return context.timeline.length <= 1;
   },
    choices: []
};
