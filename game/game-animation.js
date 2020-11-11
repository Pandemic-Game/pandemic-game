import PandemicEnv from '../lib/simulation.js';

day = 0;


results_display = {
    infected_current: 0,
    infected_total: 0,

    deaths_current: 0,
    deaths_total: 0,

    cost_medical_current: 0,
    cost_medical_total: 0,

    cost_death_current: 0,
    cost_death_total: 0,
    
    cost_economic_current: 0,
    cost_economic_total: 0,

    cost_all_current: 0,
    cost_all_total: 0
};


function runGame() {
    // Initialize pandemic simulator:

    var params = {
	num_population: 400000000, // 400 million people -- i.e. approximate US population
	init_num_infected: 1,
	R_0: 1.07, // infections double every 10 days
	imported_cases_per_step: 0,
	hospital_capacity: 1000000 // 1 million hospital beds -- https://www.aha.org/statistics/fast-facts-us-hospitals
    }
    
    var env = new PandemicEnv(
	params['num_population'],
	params['init_num_infected'],
	params['R_0'],
	params['imported_cases_per_step'],
	params['hospital_capacity']
    );

    var results = [];

    
    // Initialize lock-down controls
    
    $("#open").addClass("selected");
    
    $('#close').click(function() {
	$(".button").removeClass("selected");
	$(this).addClass("selected");
	next_action_r = 0.98;
    });
    $('#new-normal').click(function() {
	$(".button").removeClass("selected");
	$(this).addClass("selected");
	next_action_r = 1.0;
    });
    $('#open').click(function() {
	$(".button").removeClass("selected");
	$(this).addClass("selected");
	next_action_r = 1.07;
    });

    
    // Logic for running 1 time step:

    function step() {
	step_simulation();
	update_display();
    }
    
    function step_simulation() {
	day += 1;
	if (day > 365) {
	    clearInterval(interval); // game over after 365 days
	}
	
	var result_obj = env.step(next_action_r);
	var history = env.history;

	
	results_display = {
	    infected_current: result_obj["num_infected"],
	    infected_total: sum(history.map( (obj) => obj["num_infected"] )),

	    deaths_current: result_obj["num_deaths"],
	    deaths_total: sum(history.map( (obj) => obj["num_deaths"] )),
	    
	    cost_medical_current: result_obj["cost_medical"],
	    cost_medical_total: sum(history.map( (obj) => obj["cost_medical"] )),
	    
	    cost_death_current: result_obj["cost_death"],
	    cost_death_total: sum(history.map( (obj) => obj["cost_death"] )),
	    
	    cost_economic_current: result_obj["cost_economic"],
	    cost_economic_total: sum(history.map( (obj) => obj["cost_economic"] )),
	    
	    cost_all_current: result_obj["cost_all"],
	    cost_all_total:sum(history.map( (obj) => obj["cost_all"] )),
	};

	
	infectious_current += rate;
	deaths_total += rate;
	cost_total += rate;
    }

    function update_display() {
	$("#day").html(day);

	var result_keys = Object.keys(results_display);
	for (var i = 0; i < result_keys.length; ++i) {
	    var key = result_keys[i];
	    $("#" + key).html(results_display[key]);
	}
    }

    
    // Make "Start" button start the game, "Pause" button pause it.
    
    $('.start-pause').click(function() {
	if ($(this).hasClass('start')) {
	    $(this).removeClass('start');
	    $(this).addClass('pause');
	    $(this).html('Pause');
	    interval = setInterval(step, 1000);
	}
	else {
	    $(this).removeClass('pause');
	    $(this).addClass('start');
	    $(this).html('Start');
	    clearInterval(interval);
	}
    });
}
