import jStat from 'jstat';

// Probability Distributions
export class FakeNegativeBinomial {

    private mean: number;
    private variance: number;

    constructor(r: number, p: number) {
        this.mean = (p * r) / (1 - p);
        this.variance = (p * r) / ((1 - p) * (1 - p));
    }

    sample() {
        return Math.max(0, Math.floor(jStat.normal.sample(this.mean, this.variance ** 0.5)));
    }
}
