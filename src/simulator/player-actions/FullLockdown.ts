import { ContainmentPolicy } from './PlayerActions';

export const FullLockdown: ContainmentPolicy = {
    name: 'Full lockdown',
    requirements: [],
    immediateEffect: (context) => context.indicators,
    recurringEffect: (context) => {
        const updatedIndicators = { ...context.indicators };
        updatedIndicators.r = 0.95;
        return updatedIndicators;
    }
};
