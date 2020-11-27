import { ContainmentPolicy } from './PlayerActions';

export const CloseSchools: ContainmentPolicy = {
    name: 'Close schools',
    requirements: [],
    immediateEffect: (context) => context.indicators,
    recurringEffect: (context) => {
        const updatedWorldState = { ...context.indicators };
        updatedWorldState.r = updatedWorldState.r - 0.05;
        return updatedWorldState;
    }
};
