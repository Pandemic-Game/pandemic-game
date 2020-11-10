GDP_US = 2e13; // 20 trillion dollars
min_r = 0.3;
days_per_generation = 5;
generation_times_per_year = 365 / days_per_generation;
generations_per_intervention_step = 3;


class PandemicEnv {
  constructor(num_population=1000,
               initial_num_infected=100,
               R_0=4.0,
               imported_cases_per_step=0.5,
               hospital_capacity=100,
               power=1,
               gdp_per_time_step=GDP_US / generation_times_per_year, // 100 * num_population / 1000,
               distr_family='nbinom',
               dynamics='SIS',
               time_lumping=false,
               init_transition_probs=false,
              ) {
    this.num_population = num_population;
    this.initial_num_infected = initial_num_infected;
    this.R_0 = R_0;
    this.R_min = min_r;
    this.imported_cases_per_step = imported_cases_per_step;
    this.power = power;
    this.scale_factor = gdp_per_time_step / (this.R_min ** (-this.power) - this.R_0 ** (-this.power));
    this.distr_family = distr_family;
    this.dynamics = dynamics;
    this.time_lumping = time_lumping;
    this.hospital_capacity = hospital_capacity;

    this.state = initial_num_infected;
    this.done = false;
    this.reward = 0;
    
    // this.reset();
  }
  
  reset() {
    this.state = this.initial_num_infected;
    return this.state;
  }
  
  step(action_r) {
    // var epsilon = 0.000001;
    
    console.log("entering step()");
    // Execute one time step within the environment
    var prev_cases = this.state;
    console.log("prev cases: ");
    console.log(prev_cases);
    // var r = this.actions_r[action]

    var distr = this._new_state_distribution(prev_cases, action_r, this.imported_cases_per_step);
    var new_num_infected = distr.sample();
    new_num_infected = Math.max(Math.floor(new_num_infected), 0);
    console.log("new_num_infected");
    console.log(new_num_infected);
    new_num_infected = Math.min(new_num_infected, this.num_population);
    console.log("new_num_infected");
    console.log(new_num_infected);
    
    var new_state = new_num_infected;
    
    console.log("new_state");
    console.log(new_state);
    
    var result_obj = {}
    result_obj["num_infected"] = new_num_infected;
    result_obj["cost_total"] = this.cost(new_state, action_r);
    result_obj["cost_medical"] = this._cost_of_n(new_num_infected);
    result_obj["cost_lockdown"] = this._cost_of_r(action_r);

    // Add new observation to state array
    this.state = new_state;
    console.log("new_state");
    console.log(new_state);

    var obs = new_state;
    var done = this.done;

    console.log("exiting step()");
    
    // return [obs, reward, done, {}]
    return result_obj;
  }
  
  _reward(num_infected, r) {
    return -this._cost_of_n(num_infected) - this._cost_of_r(r)
  }
  
  cost(num_infected, r) {
    return -this._reward(num_infected, r);
  }

  _cost_of_r(r) {
    /*var baseline = 1/(this.R_0 ** this.power)
    var actual = 1/(r ** this.power)

    // cost_to_keep_half_home / (1/((num_population/4)**power) - 1/(R_0 ** power))
    if (r >= this.R_0) {
      return 0;
    } else {
      return (actual - baseline) * this.scale_factor  // (actual - baseline);
    }*/
    
    if (r >= this.R_0) {
      return 0;
    } else {
      return this.scale_factor * (this.R_0 - r) / this.R_0;
    }
  }

  _cost_of_n(n, death_rate_within=0.01, death_rate_above=0.1) {
    var cost_per_death = 1e7; // https://www.npr.org/transcripts/835571843: value of a statistical life
    var cost_within = death_rate_within * cost_per_death;
    var cost_above = death_rate_above * cost_per_death;
    
    if (n <= 0) {
      return 0;
    } else {
      if (n < this.hospital_capacity) {
        return n * cost_within;
      } else {
        return this.hospital_capacity * cost_within + (n - this.hospital_capacity) * cost_above;
      }
    }
  }
  
  _expected_new_state(num_infected, r) {
    var fraction_susceptible = 1;
    var expected_new_cases = (num_infected * r) * fraction_susceptible + this.imported_cases_per_step
    return expected_new_cases;
  }
  
  _new_state_distribution(num_infected, action_r) {
    console.log("entering _new_state_distribution");
    var NegativeBinomial = stdlib.base.dists.negativeBinomial.NegativeBinomial;

    var lam = this._expected_new_state(num_infected, action_r);
    //var r = 100000000000000.0;
    //var p = lam / (r + lam);
    // var dist = new NegativeBinomial(r, 1-p);
    // var dist = new Poisson(lam);
    var dist = new Uniform(lam, lam);
    return dist;
  }
}
