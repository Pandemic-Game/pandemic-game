import { ContainmentPolicy } from './PlayerActions';

export const CloseBusinesses: ContainmentPolicy = {
    id: 'business',
    name: 'Businesses', // 'Close all non-essential businesses',
    icon: 'fa-dollar-sign',
    requirements: [],
    activeLabel: 'Closed',
    inactiveLabel: 'Open',
    immediateEffect: (context) => context.indicators,
    recurringEffect: (context) => {
        const updatedWorldState = { ...context.indicators };
        updatedWorldState.r = Math.max(updatedWorldState.r - 0.03, 0);
        return updatedWorldState;
    }
};
