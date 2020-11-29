import { ContainmentPolicy } from './PlayerActions';

export const RequireMasks: ContainmentPolicy = {
    id: 'masks',
    name: 'Require masks',
    icon: 'fa-head-side-mask',
    requirements: [],
    immediateEffect: (context) => context.indicators,
    recurringEffect: (context) => {
        const updatedWorldState = { ...context.indicators };
        updatedWorldState.r = Math.max(updatedWorldState.r - 0.03, 0);
        return updatedWorldState;
    }
};
