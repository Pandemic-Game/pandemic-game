import { SimulatorState } from '../SimulatorState';
import { InGameEvent } from './InGameEvents';

export const HospitalCapacityExceeded: InGameEvent = {
    name: 'Hospital capacity exceeded',
    description:
        'Hospital capacity has been exceeded. Deaths are rising, people are self-isolating and businesses are closing.',
    happensOnce: false,
    cssClass: 'alert alert-danger',
    canActivate: (context: SimulatorState) => {
        if (context.history.length === 0) {
            return false;
        } else {
            const lastTurn = context.timeline[context.timeline.length - 1];

            // Assuming a 20% hospitalization rate:
            const totalInfectedRequiringHospitalization =
                lastTurn.history.reduce((prev, current) => {
                    return prev + current.numInfected;
                }, 0) * 0.2;

            // Assuming an average stay of 5 days
            // Sources: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7467845/
            const totalHospitalCapacity =
                lastTurn.history.reduce((prev, current) => {
                    return prev + current.hospitalCapacity;
                }, 0) / 5;

            // Some infections last longer than average taking up hospital space
            return totalInfectedRequiringHospitalization > totalHospitalCapacity * 0.8;
        }
    },
    choices: []
};
