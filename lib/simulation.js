//stdlib = require( "https://unpkg.com/@stdlib/stdlib@0.0.32/dist/stdlib-flat.min.js" );
//jStat = require("//cdn.jsdelivr.net/npm/jstat@latest/dist/jstat.min.js");


// Probability Distributions

class Uniform {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
  
  sample() {
    return jStat.uniform.sample(this.a, this.b);
  }
}

class Constant {
    constructor(x) {
	this.x = x;
    }

    sample() {
	return this.x;
    }
}

class FakeNegativeBinomial {
    constructor(r, p) {
	this.r = r;
	this.p = p;

	this.mean = this.p * this.r / (1 - this.p);
	this.variance = this.p * this.r / ((1 - this.p) * (1 - this.p));

    }

    /*
    pmf(k) {
	return combination(k + this.r - 1, k) * ((1 - this.p) ** this.r) * (this.p ** k)
    }
    */
    
    sample() {

	return Math.max(0,
			Math.floor(jStat.normal.sample(this.mean, this.variance ** 0.5)));

	/*
	var probs = [];
	for (var k = Math.floor(mean - variance); k < mean + variance; k++) {
	    probs.push(this.pmf(k));
	}
	return Math.floor(mean - variance) + Sampling.Discrete(probs).draw();
	*/
    }
}


// Simulation Parameters

GDP_US = 2e13; // 20 trillion dollars: annual US GDP
min_r = 0.3;


class PandemicEnv {
  constructor(num_population=1000,
               initial_num_infected=100,
               R_0=(2.0 ** 0.1), // infections double every 10 days
               imported_cases_per_day=0.5,
               hospital_capacity=100,
               power=1,
               gdp_per_day=GDP_US / 365.0,
               distr_family='nbinom',
               dynamics='SIS',
               time_lumping=false,
               init_transition_probs=false,
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
	
    var result_obj = {}
    result_obj["action_r"] = this.R_0;
    result_obj["num_infected"] = this.initial_num_infected;
    result_obj["num_deaths"] = 0;
    result_obj["cost_all"] = this.cost(result_obj);
    result_obj["cost_medical"] = this._cost_of_infections(result_obj["num_infected"]);
    result_obj["cost_economic"] = this._cost_of_action(result_obj["action_r"]);
    result_obj["cost_death"] = this._cost_of_deaths(result_obj["num_deaths"]);

    this.history.push(result_obj);
    return result_obj;
  }
  
  step(action_r, days) {
    // var epsilon = 0.000001;
    
    //console.log("entering step()");
    // Execute one time step within the environment
    //console.log("prev cases: ");
    //console.log(prev_cases);
      // var r = this.actions_r[action]

    action_r = action_r ** days; // compounding effect of a repeated action
    var last_result = this.history[this.history.length - 1];
    var prev_cases = last_result['num_infected'];

    // Don't allow cases to exceed hospital capacity
    var lockdown_ratio = this.hospital_capacity / prev_cases;
    var capped_action_r = (prev_cases * action_r >= this.hospital_capacity) ? lockdown_ratio : action_r;
    action_r = capped_action_r;

    // Compute next state
    // var distr = this._new_state_distribution(prev_cases, action_r, this.imported_cases_per_step);
    // var new_num_infected = distr.sample();
    var new_num_infected = this._new_random_state(prev_cases, action_r, this.imported_cases_per_step * days);
    new_num_infected = Math.max(Math.floor(new_num_infected), 0);
    //console.log("new_num_infected");
    //console.log(new_num_infected);
    new_num_infected = Math.min(new_num_infected, this.num_population);
    //console.log("new_num_infected");
    //console.log(new_num_infected);
    
    var new_state = new_num_infected;
    
    //console.log("new_state");
    //console.log(new_state);

    // Deaths from 20 time-steps (i.e. 20 days) ago
    var lag = 20;
    var long_enough = (this.history.length > lag);
    var new_deaths_lagging = long_enough ? (this.history[this.history.length - lag]['num_infected'] * 0.01) : 0;
          
    var result_obj = {}
    result_obj["action_r"] = action_r;
    result_obj["num_infected"] = new_num_infected;
    result_obj["num_deaths"] = new_deaths_lagging;
    result_obj["cost_all"] = this.cost(result_obj, days);
    result_obj["cost_medical"] = this._cost_of_infections(new_num_infected);
    result_obj["cost_economic"] = this._cost_of_action(action_r, days);
    result_obj["cost_death"] = this._cost_of_deaths(new_deaths_lagging);
    
    // Add new observation to state array
    this.state = new_state;
    //console.log("new_state");
    //console.log(new_state);

    var obs = new_state;
    var done = this.done;

    //console.log("exiting step()");
    
    // return [obs, reward, done, {}]
    this.history.push(result_obj);
    return result_obj;
  }
  
  cost(result_obj, days) {
    return this._cost_of_infections(result_obj["num_infected"]) +
           this._cost_of_action(result_obj["action_r"], days) +
           this._cost_of_deaths(result_obj["num_deaths"]);
  }

  _cost_of_action(r, days) {
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
	return this.scale_factor * (this.R_0 ** 10 - r ** 10) / (this.R_0 ** 10) * days;
    }
  }

  _cost_of_deaths(num_deaths) {
    var cost_per_death = 1e7; // https://www.npr.org/transcripts/835571843: value of a statistical life
    return num_deaths * cost_per_death;
  }
    
  _cost_of_infections(num_infected, death_rate_within=0.01, death_rate_above=0.1) {
      var hospitalization_rate = 0.1; // 10% of those infected will require hospitalization
      var num_hospitalizations = num_infected * hospitalization_rate;
      var cost_per_hospitalization = 50000; // $50,000 per hospital visit -- average amount billed to insurance (can dig up this reference if needed; it was on this order of magnitude)

      return num_hospitalizations * cost_per_hospitalization;
  }
  
  _expected_new_state(num_infected, r) {
    var fraction_susceptible = 1;
    var expected_new_cases = (num_infected * r) * fraction_susceptible + this.imported_cases_per_step
    return expected_new_cases;
  }
  
  _new_state_distribution(num_infected, action_r) {
    //console.log("entering _new_state_distribution");
    //var NegativeBinomial = stdlib.base.dists.negativeBinomial.NegativeBinomial;

    var lam = this._expected_new_state(num_infected, action_r);
    //var r = 100000000000000.0;
    //var p = lam / (r + lam);
    var dist = new (r, 1-p);
    // var dist = new Poisson(lam);
    //var dist = new Uniform(lam, lam);
    //var dist = new Constant(lam);
    return dist;
  }


  _new_random_state(num_infected, action_r) {
    //console.log("entering _new_state_distribution");
    //var NegativeBinomial = stdlib.base.dists.negativeBinomial.NegativeBinomial;

    var lam = this._expected_new_state(num_infected, action_r);
    var r = 50.0;
    var p = lam / (r + lam);
    //var new_num_infected = Sampling.NegBinomial(r, p);
    var new_num_infected = (new FakeNegativeBinomial(r, p)).sample();  
    // var dist = new Poisson(lam);
    //var dist = new Uniform(lam, lam);
    //var dist = new Constant(lam);
    return new_num_infected;
  }
}


function makeEnv() {

    var params = {
	num_population: 400000000, // 400 million people -- i.e. approximate US population
	init_num_infected: 10000, // 100,000 people infected -- we're in the middle of a pandemic!
	R_0: 1.08 ** 10, // infections double every 10 days
	imported_cases_per_day: 0.1,
	hospital_capacity: 1000000 // 1 million hospital beds -- https://www.aha.org/statistics/fast-facts-us-hospitals
    };
    
    return new PandemicEnv(
	params['num_population'],
	params['init_num_infected'],
	params['R_0'],
	params['imported_cases_per_day'],
	params['hospital_capacity']
    );
}
