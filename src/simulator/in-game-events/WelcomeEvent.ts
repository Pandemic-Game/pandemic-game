import { SimulatorState } from '../SimulatorState';
import { InGameEvent } from './InGameEvents';

export const WelcomeEvent: InGameEvent = {
    name: 'Welcome event',
    description: `Welcome, you will be responsible for coordinating the response to the Covid-19 pandemic over the next twelve months.
    Your goal is to minimize the loss of life and the economic impacts.
    Please choose your course of action in the <b>Actions</b> panel and click <b>Next turn</b> to see the consequences.`,
    happensOnce: true,
    cssClass: 'alert alert-primary',
    canActivate: (context: SimulatorState) => {
        return context.timeline.length === 0;
    },
    choices: []
};
