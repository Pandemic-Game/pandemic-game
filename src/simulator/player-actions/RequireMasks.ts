import { ContainmentPolicy } from './PlayerActions';

export const RequireMasks: ContainmentPolicy = {
    name: 'Require masks',
    requirements: [],
    immediateEffect: (context) => context.indicators,
    recurringEffect: (context) => {
        const updatedWorldState = { ...context.indicators };
        updatedWorldState.r = updatedWorldState.r - 0.03;
        return updatedWorldState;
    }
};
