import { ContainmentPolicy } from './PlayerActions';

export const CloseBusinesses: ContainmentPolicy = {
    id: 'business',
    name: 'Close all non-essential businesses',
    icon: 'fa-briefcase',
    requirements: [],
    immediateEffect: (context) => context.indicators,
    recurringEffect: (context) => {
        const updatedWorldState = { ...context.indicators };
        updatedWorldState.r = updatedWorldState.r - 0.07;
        return updatedWorldState;
    }
};
