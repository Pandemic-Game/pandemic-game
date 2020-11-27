import { ContainmentPolicy } from './PlayerActions';

export const BusinessAsUsual: ContainmentPolicy = {
    name: 'Business as usual',
    requirements: [],
    immediateEffect: (context) => context.indicators,
    recurringEffect: (context) => {
        const updatedIndicators = { ...context.indicators };
        updatedIndicators.r = 1.08;
        return updatedIndicators;
    }
};
