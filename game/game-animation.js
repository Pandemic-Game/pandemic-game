day = 0;
infectious_current = 0;
deaths_total = 0;
cost_total = 0;

rate = 3;

function runGame() {
    // Initialize pandemic simulator:

    var params = {
	num_population: 400000000,
	init_num_infected: 1,
	R_0: 2.5,
	imported_cases_per_step: 0,
	hospital_capacity: 1000000
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
	next_action_r = 0.7;
    });
    $('#new-normal').click(function() {
	$(".button").removeClass("selected");
	$(this).addClass("selected");
	next_action_r = 1.0;
    });
    $('#open').click(function() {
	$(".button").removeClass("selected");
	$(this).addClass("selected");
	next_action_r = 2.5;
    });

    
    // Logic for running 1 time step:

    function step() {
	step_simulation();
	update_display();
    }
    
    function step_simulation() {
	day += 1;

	var result_obj = env.step(next_action_r);
	
	infectious_current += rate;
	deaths_total += rate;
	cost_total += rate;
    }

    function update_display() {
	$("#day").html(day);
	$("#infectious_current").html(infectious_current);
	$("#deaths_total").html(deaths_total);
	$("#cost_total").html(cost_total);
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
