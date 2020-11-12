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

window.next_action_r = 1.08;

function runGame(env) {
    // Initialize pandemic simulator:

    var results = [];

    
    
    // Initialize lock-down controls
    
    //$("#open").addClass("selected");
    
    $('#close').click(function() {
	$(".button").removeClass("selected");
	$(this).addClass("selected");
	window.next_action_r = 0.98;
    });
    $('#new-normal').click(function() {
	$(".button").removeClass("selected");
	$(this).addClass("selected");
	window.next_action_r = 1.0;
    });
    $('#open').click(function() {
	$(".button").removeClass("selected");
	$(this).addClass("selected");
	window.next_action_r = 1.08;
    });

    $('#new-normal').click();
    
    // Logic for running 1 time step:

    function step() {
	step_simulation();
	update_display();
    }
    
    function step_simulation() {
	var days_per_step = 10;
	
	day += days_per_step;
	if (day > 365) {
	    clearInterval(interval); // game over after 365 days
	}
	
	env.step(window.next_action_r ** days_per_step);
    }

    function update_display() {
	$("#day").html(day);

	var history = env.history;
	var result_obj = history[history.length - 1];
	
	var results_display = {
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

	var result_keys = Object.keys(results_display);
	for (var i = 0; i < result_keys.length; ++i) {
	    var key = result_keys[i];
	    var quantity = results_display[key];
	    var formatted = nFormatter(quantity, 1);
	    if (key.indexOf("cost") > -1) {
		formatted = "$" + formatted;
	    }
	    $("#" + key).html(formatted);
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

    // Run 1 step of game, just to display initial numbers
    update_display();
}
