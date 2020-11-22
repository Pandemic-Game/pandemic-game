import { ContainmentPolicy } from './PlayerActions';

export const NewNormal: ContainmentPolicy = {
    name: 'New normal',
    requirements: [],
    immediateEffect: (context) => context.indicators,
    recurringEffect: (context) => {
        const updatedWorldState = { ...context.indicators };
        updatedWorldState.r = 1.0;
        return updatedWorldState;
    }
};
