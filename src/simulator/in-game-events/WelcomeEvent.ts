import { SimulatorState } from '../SimulatorState';
import { InGameEvent } from './InGameEvents';

export const WelcomeEvent: InGameEvent = {
    name: 'Welcome event',
    description: `Welcome! In this game you will help control the Covid crisis.`,
    happensOnce: true,
    cssClass: 'alert alert-primary',
    canActivate: (context: SimulatorState) => true,
    choices: []
};

export const HowToWinEvent: InGameEvent = {
    name: 'How to win event',
    description: `
        Explore different responses to the challenges we will face in 2021 with COVID-19. 
        This game has multiple endings based on your actions.`,
    happensOnce: true,
    cssClass: 'alert alert-primary',
    canActivate: (context: SimulatorState) => true,
    choices: []
};

export const HowToPlayEvent: InGameEvent = {
    name: 'How to play event',
    description: `
        You will be given information and asked to respond to events the same way policy makers have had, 
        you will need to respond quickly and consider the different economic, social and healthcare needs. 
        If you upset businesses, the public or the healthcare system too much you will be voted out of office!
    `,
    happensOnce: true,
    cssClass: 'alert alert-primary',
    canActivate: (context: SimulatorState) => true,
    choices: []
};