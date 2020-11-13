/* eslint-disable camelcase, no-underscore-dangle, class-methods-use-this */

import jStat from 'jstat';

// Probability Distributions
class FakeNegativeBinomial {
    constructor(r, p) {
        this.r = r;
        this.p = p;

        this.mean = (this.p * this.r) / (1 - this.p);
        this.variance = (this.p * this.r) / ((1 - this.p) * (1 - this.p));
    }

    sample() {
        return Math.max(0, Math.floor(jStat.normal.sample(this.mean, this.variance ** 0.5)));
    }
}

// Simulation Parameters
const GDP_US = 2e13; // 20 trillion dollars: annual US GDP
const min_r = 0.3;

class PandemicEnv {
    constructor(
        num_population = 1000,
        initial_num_infected = 100,
        R_0 = 2.0 ** 0.1, // infections double every 10 days
        imported_cases_per_day = 0.5,
        hospital_capacity = 100,
        power = 1,
        gdp_per_day = GDP_US / 365.0,
        distr_family = 'nbinom',
        dynamics = 'SIS',
        time_lumping = false
    ) {
        this.num_population = num_population;
        this.initial_num_infected = initial_num_infected;
        this.R_0 = R_0;
        this.R_min = min_r;
        this.imported_cases_per_step = imported_cases_per_day;
        this.power = power;
        this.scale_factor = gdp_per_day * 0.2; // fraction of the economy that would be sacrificed by full lock-down
        this.distr_family = distr_family;
        this.dynamics = dynamics;
        this.time_lumping = time_lumping;
        this.hospital_capacity = hospital_capacity;

        this.reset();
    }

    reset() {
        this.history = [];

        const result_obj = {};
        result_obj.action_r = this.R_0;
        result_obj.num_infected = this.initial_num_infected;
        result_obj.num_deaths = 0;
        result_obj.cost_all = this.cost(result_obj);
        result_obj.cost_medical = this._cost_of_infections(result_obj.num_infected);
        result_obj.cost_economic = this._cost_of_action(result_obj.action_r);
        result_obj.cost_death = this._cost_of_deaths(result_obj.num_deaths);

        this.history.push(result_obj);
        return result_obj;
    }

    step(r, days) {
        let action_r = r;
        action_r **= days; // compounding effect of a repeated action
        const last_result = this.history[this.history.length - 1];
        const prev_cases = last_result.num_infected;

        // Don't allow cases to exceed hospital capacity
        const lockdown_ratio = this.hospital_capacity / prev_cases;
        const capped_action_r = prev_cases * action_r >= this.hospital_capacity ? lockdown_ratio : action_r;
        action_r = capped_action_r;

        // Compute next state
        let new_num_infected = this._new_random_state(prev_cases, action_r, this.imported_cases_per_step * days);
        new_num_infected = Math.max(Math.floor(new_num_infected), 0);
        // console.log("new_num_infected");
        // console.log(new_num_infected);
        new_num_infected = Math.min(new_num_infected, this.num_population);
        // console.log("new_num_infected");
        // console.log(new_num_infected);

        const new_state = new_num_infected;

        // console.log("new_state");
        // console.log(new_state);

        // Deaths from infections started 20 days ago
        const lag = Math.floor(20 / days); // how many steps, of `days` length each, need to have passed?
        const long_enough = this.history.length > lag;
        const new_deaths_lagging = long_enough ? this.history[this.history.length - lag].num_infected * 0.01 : 0;

        const result_obj = {};
        result_obj.action_r = action_r;
        result_obj.num_infected = new_num_infected;
        result_obj.num_deaths = new_deaths_lagging;
        result_obj.cost_all = this.cost(result_obj, days);
        result_obj.cost_medical = this._cost_of_infections(new_num_infected);
        result_obj.cost_economic = this._cost_of_action(action_r, days);
        result_obj.cost_death = this._cost_of_deaths(new_deaths_lagging);

        // Add new observation to state array
        this.state = new_state;
        this.history.push(result_obj);
        return result_obj;
    }

    cost(result_obj, days) {
        return (
            this._cost_of_infections(result_obj.num_infected) +
            this._cost_of_action(result_obj.action_r, days) +
            this._cost_of_deaths(result_obj.num_deaths)
        );
    }

    _cost_of_action(r, days) {
        if (r >= this.R_0) {
            return 0;
        }
        return ((this.scale_factor * (this.R_0 ** 10 - r ** 10)) / this.R_0 ** 10) * days;
    }

    _cost_of_deaths(num_deaths) {
        const cost_per_death = 1e7; // https://www.npr.org/transcripts/835571843: value of a statistical life
        return num_deaths * cost_per_death;
    }

    _cost_of_infections(num_infected) {
        const hospitalization_rate = 0.1; // 10% of those infected will require hospitalization
        const num_hospitalizations = num_infected * hospitalization_rate;
        const cost_per_hospitalization = 50000; // $50,000 per hospital visit -- average amount billed to insurance (can dig up this reference if needed; it was on this order of magnitude)

        return num_hospitalizations * cost_per_hospitalization;
    }

    _expected_new_state(num_infected, r) {
        const fraction_susceptible = 1;
        const expected_new_cases = num_infected * r * fraction_susceptible + this.imported_cases_per_step;
        return expected_new_cases;
    }

    _new_random_state(num_infected, action_r) {
        const lam = this._expected_new_state(num_infected, action_r);
        const r = 50.0;
        const p = lam / (r + lam);
        const new_num_infected = new FakeNegativeBinomial(r, p).sample();
        return new_num_infected;
    }
}

function makeEnv() {
    const params = {
        num_population: 400000000, // 400 million people -- i.e. approximate US population
        init_num_infected: 10000, // 100,000 people infected -- we're in the middle of a pandemic!
        R_0: 1.08, // infections double every 10 days
        imported_cases_per_day: 0.1,
        hospital_capacity: 1000000, // 1 million hospital beds -- https://www.aha.org/statistics/fast-facts-us-hospitals
    };

    return new PandemicEnv(
        params.num_population,
        params.init_num_infected,
        params.R_0,
        params.imported_cases_per_day,
        params.hospital_capacity
    );
}

export default {
    makeEnv,
};
