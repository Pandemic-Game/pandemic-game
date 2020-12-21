import { ContainmentPolicy } from './PlayerActions';

export const CloseBusinesses: ContainmentPolicy = {
    id: 'business',
    name: 'Businesses', // 'Close all non-essential businesses',
    icon: 'fa-dollar-sign',
    requirements: [],
    activeLabel: 'Closed',
    inactiveLabel: 'Open',
    immediateEffect: (context) => {
        const updatedWorldState = { ...context.indicators };
        updatedWorldState.GDP = updatedWorldState.GDP * 0.8;
        return updatedWorldState;
    },
    recurringEffect: (context) => {
        const updatedWorldState = { ...context.indicators };
        updatedWorldState.r = Math.max(updatedWorldState.r - 0.03, 0);
        updatedWorldState.GDP = updatedWorldState.GDP * 0.98;
        return updatedWorldState;
    }
};
