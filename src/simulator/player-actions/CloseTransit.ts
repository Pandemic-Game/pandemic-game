import { ContainmentPolicy } from './PlayerActions';

export const CloseTransit: ContainmentPolicy = {
    id: 'transit',
    name: 'Close transit (buses, trains, airports)',
    icon: 'fa-car-side',
    requirements: [],
    immediateEffect: (context) => context.indicators,
    recurringEffect: (context) => {
        const updatedWorldState = { ...context.indicators };
        updatedWorldState.r = Math.min(updatedWorldState.r - 0.04, 0);
        return updatedWorldState;
    }
};
