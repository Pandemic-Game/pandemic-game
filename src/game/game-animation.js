/* eslint-disable no-plusplus */
import $ from 'jquery';
import { nFormatter, sum } from '../lib/util';
import LinePlot from '../lib/LinePlot';
import PeoplePlot from '../lib/PeoplePlot';
import BarPlot from '../lib/BarPlot';

export default function runGame(env) {
    // Initialize pandemic simulator:

    let interval;
    let day = 0;
    let nextActionR = 1.08;

    // Initialize lock-down controls
	// $("#open").addClass("selected");
	 
	// Initialize plots
	let model_humans = {
		"x_axis":{
			"name":"days",
			"min":0,
			"max":400,
			"step":10,
			"formatter":(value => nFormatter(value,1)),
		},
		"y_axis":{
			"name":"humans",
			"min":0,
			"max":50000,
			"formatter":(value => nFormatter(value,1)),
		},
		"lines":[{
			"name":"Infected",
			"color":"#0000F0",
		},{
			"name":"Deaths",
			"color":"#E00000",
		}],
	};
	let model_costs = {
		"x_axis":{
			"name":"days",
			"min":0,
			"max":400,
			"step":10,
			"formatter":(value => nFormatter(value,1)),
		},
		"y_axis":{
			"name":"$",
			"min":0,
			"max":120000000000,
			"formatter":(value => nFormatter(value,1)),
		},
		"lines":[{
			"name":"Cost of Hospitalizations",
			"color":"#0000F0",
		},{
			"name":"Cost of Deaths",
			"color":"#E00000",
		},{
			"name":"Lost Economic Activity",
			"color":"#00C000",
		}],
	};
	
	let model_bar_humans = {
		"x_axis":{
			"name":"days",
			"min":0,
			"max":400,
			"step":10,
			"formatter":(value => nFormatter(value,1)),
		},
		"y_axis":{
			"name":"$",
			"min":0,
			"max":50000,
			"formatter":(value => nFormatter(value,1)),
		},
		"lines":[{
			"name":"Cost of Hospitalizations",
			"color":"#0000F0",
		}],
	};
	//let plot_humans = new LinePlot(	"plot_humans", model_humans);
	let plot_humans = new PeoplePlot("plot_humans", model_humans);
	let plot_costs = new LinePlot("plot_costs", model_costs);
	let bar_humans = new BarPlot("bar_humans",model_bar_humans);
   
    $('#close').click((e) => {
        const target = $(e.target);
        $('.button').removeClass('selected');
        $(target).addClass('selected');
        nextActionR = 0.95;
    });
    $('#new-normal').click((e) => {
        const target = $(e.target);
        $('.button').removeClass('selected');
        $(target).addClass('selected');
        nextActionR = 1.0;
    });
    $('#open').click((e) => {
        const target = $(e.target);
        $('.button').removeClass('selected');
        $(target).addClass('selected');
        nextActionR = 1.08;
    });

    // Logic for running 1 time step:

    function stepSimulation() {
        const daysPerStep = 10;

        day += daysPerStep;
        if (day > 365) {
            clearInterval(interval); // game over after 365 days
        }

        env.step(nextActionR, daysPerStep);
    }

    function updateDisplay() {
        $('#day').html(day);

        const { history } = env;
        const resultObj = history[history.length - 1];

        const resultsDisplay = {
            infected_current: resultObj.num_infected,
            infected_total: sum(history.map((obj) => obj.num_infected)),

            deaths_current: resultObj.num_deaths,
            deaths_total: sum(history.map((obj) => obj.num_deaths)),

            cost_medical_current: resultObj.cost_medical,
            cost_medical_total: sum(history.map((obj) => obj.cost_medical)),

            cost_death_current: resultObj.cost_death,
            cost_death_total: sum(history.map((obj) => obj.cost_death)),

            cost_economic_current: resultObj.cost_economic,
            cost_economic_total: sum(history.map((obj) => obj.cost_economic)),

            cost_all_current: resultObj.cost_all,
            cost_all_total: sum(history.map((obj) => obj.cost_all)),
        };

        const resultKeys = Object.keys(resultsDisplay);
        for (let i = 0; i < resultKeys.length; ++i) {
            const key = resultKeys[i];
            const quantity = resultsDisplay[key];
            let formatted = nFormatter(quantity, 1);
            if (key.indexOf('cost') > -1) {
                formatted = `$${formatted}`;
            }
            $(`#${key}`).html(formatted);
        }
		
		plot_humans.appendValues([resultObj.num_infected,resultsDisplay.deaths_total]);
		bar_humans.appendValues([resultsDisplay.deaths_total])
		plot_costs.appendValues([resultObj.cost_medical,resultObj.cost_death,resultObj.cost_economic]);
    }

    function step() {
        stepSimulation();
        updateDisplay();
    }
	
	

    // Make "Start" button start the game, "Pause" button pause it.
    $('.start-pause').click((e) => {
        const target = $(e.target);
        if (target.hasClass('start')) {
			target.removeClass('start');
            target.addClass('pause');
            target.html('Pause');
            interval = setInterval(step, 2000);
        } else {
            target.removeClass('pause');
            target.addClass('start');
            target.html('Start');
            clearInterval(interval);
        }
    });

    // Run 1 step of game, just to display initial numbers
    $('#new-normal').click();
    updateDisplay();
}
