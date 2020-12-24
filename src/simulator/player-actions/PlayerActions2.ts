import { Indicators, WorldState } from '../SimulatorState';

interface PolicyOption<T> {
    label: string;
    value: T;
}

export interface ContainmentPolicy2<T> {
    id: string;
    name: string;
    options: PolicyOption<T>[];
    immediateEffect: (context: WorldState, selectedOption: T) => Indicators;
    recurringEffect: (context: WorldState, selectedOption: T) => Indicators;
}

/**
 * Models a choice a player has made on a particular containment policy
 */
export interface PlayerContainmentPolicyChoice<T> {
    selectedOption: T;
    containmentPolicyId: string;
}

export const StayAtHomeOrder: ContainmentPolicy2<boolean> = {
    id: 'stayAtHomeOrder',
    name: 'Stay-at-Home Order',
    options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
    ],
    immediateEffect: (context: WorldState, selectedOption: boolean) => context.indicators,
    recurringEffect: (context: WorldState, selectedOption: boolean) => {
        const updatedWorldState = { ...context.indicators };
        if (selectedOption) {
            updatedWorldState.r = updatedWorldState.r * 0.228;
        }
        return updatedWorldState;
    }
};

export type GatheringSizeOpts = 10 | 100 | 1000 | 'Infinity';
export const GatheringSize: ContainmentPolicy2<GatheringSizeOpts> = {
    id: 'GatheringSize',
    name: 'Gathering Size',
    options: [
        { label: 'Unlimited', value: 'Infinity' },
        { label: '1000', value: 1000 },
        { label: '100', value: 100 },
        { label: '10', value: 10 }
    ],
    immediateEffect: (context: WorldState, selectedOption: GatheringSizeOpts) => context.indicators,
    recurringEffect: (context: WorldState, selectedOption: GatheringSizeOpts) => {
        const updatedWorldState = { ...context.indicators };
        if (selectedOption !== 'Infinity') {
            let multiplicativeFactor = 0;
            switch (selectedOption) {
                case 10:
                    multiplicativeFactor += 0.076;
                case 100:
                    multiplicativeFactor += 0.116;
                case 1000:
                    multiplicativeFactor += 0.227;
            }

            updatedWorldState.r = updatedWorldState.r * (1 - multiplicativeFactor);
        }
        return updatedWorldState;
    }
};

export type BusinessClosingsOpts = 'None' | 'Some' | 'Most';
export const BusinessClosings: ContainmentPolicy2<BusinessClosingsOpts> = {
    id: 'BusinessClosings',
    name: 'Business Closings',
    options: [
        { label: 'None', value: 'None' },
        { label: 'Some', value: 'Some' },
        { label: 'Most', value: 'Most' }
    ],
    immediateEffect: (context: WorldState, selectedOption: BusinessClosingsOpts) => context.indicators,
    recurringEffect: (context: WorldState, selectedOption: BusinessClosingsOpts) => {
        const updatedWorldState = { ...context.indicators };
        if (selectedOption !== 'None') {
            let multiplicativeFactor = 0;

            switch (selectedOption) {
                case 'Most':
                    multiplicativeFactor += 0.089;
                case 'Some':
                    multiplicativeFactor += 0.175;
            }

            updatedWorldState.r = updatedWorldState.r * (1 - multiplicativeFactor);
        }
        return updatedWorldState;
    }
};

export const SchoolsAndUniveristyClosures: ContainmentPolicy2<boolean> = {
    id: 'SchoolAndUniversityClosures',
    name: 'Schools + Universities Closed',
    options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
    ],
    immediateEffect: (context: WorldState, selectedOption: boolean) => context.indicators,
    recurringEffect: (context: WorldState, selectedOption: boolean) => {
        const updatedWorldState = { ...context.indicators };
        if (selectedOption) {
            updatedWorldState.r = updatedWorldState.r * 0.621;
        }
        return updatedWorldState;
    }
};
