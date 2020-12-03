import { ContainmentPolicy } from './PlayerActions';

export const CloseBusinesses: ContainmentPolicy = {
    id: 'business',
    name: 'Close businesses', // 'Close all non-essential businesses',
    icon: 'fa-briefcase',
    requirements: [],
    immediateEffect: (context) => context.indicators,
    recurringEffect: (context) => {
        const updatedWorldState = { ...context.indicators };
        updatedWorldState.r = Math.max(updatedWorldState.r - 0.07, 0);
        return updatedWorldState;
    }
};
