function createMessageStream() {
    for (var i = 0; i < 10; ++i) {
	var new_element = $("<div class='message'>Message " + i + "</div>");
	$(".body").append(new_element);
	console.log("Message " + i);
	// new_element.scrollIntoView();
    }
}



day = 0;
infectious_current = 0;
deaths_total = 0;
cost_total = 0;

rate = 3;

function runGame() {
    $("#open").addClass("selected");

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

    $('#close').click(function() {
	$(".button").removeClass("selected");
	$(this).addClass("selected");
	rate = 0;
    });
    $('#new-normal').click(function() {
	$(".button").removeClass("selected");
	$(this).addClass("selected");
	rate = 1;
    });
    $('#open').click(function() {
	$(".button").removeClass("selected");
	$(this).addClass("selected");
	rate = 3;
    });

    
    function step_simulation() {
	day += 1;
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

    function step() {
	console.log("In step()");
	console.log("infectious_current: " + infectious_current);
	step_simulation();
	update_display();
    }

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
