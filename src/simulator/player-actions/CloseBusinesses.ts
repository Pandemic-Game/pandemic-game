import { ContainmentPolicy } from './PlayerActions';

export const CloseBusinesses: ContainmentPolicy = {
    name: 'Close all non-essential businesses',
    requirements: [],
    immediateEffect: (context) => context.indicators,
    recurringEffect: (context) => {
        const updatedWorldState = { ...context.indicators };
        updatedWorldState.r = updatedWorldState.r - 0.07;
        return updatedWorldState;
    }
};
