import { ContainmentPolicy } from './PlayerActions';

export const CloseSchools: ContainmentPolicy = {
    id: 'schools',
    name: 'Close schools',
    icon: 'fa-graduation-cap',
    requirements: [],
    immediateEffect: (context) => context.indicators,
    recurringEffect: (context) => {
        const updatedWorldState = { ...context.indicators };
        updatedWorldState.r = Math.min(updatedWorldState.r - 0.05, 0);
        return updatedWorldState;
    }
};
