/*
This file contains all classes for frontend components.
*/

/*
	The plot class represents a normal line plot.
	
	How to use:
	If we want to use a plot, we need a div-tag and a
	model object. The model must contain objects for
	 - x-axis with name, min, max and step
	 - y-axis with name, min, and max
	 - lines: array of objects with name, color
	 - formatter: fuction to parse int to string
	 
	example:
	HTML-code:
	<div id="plot_id" class="plot"></div>
	
	JS-code:
	let model_humans = {
		"x_axis":{
			"name":"x",
			"min":0,
			"max":100,
			"step":10,
		},
		"y_axis":{
			"name":"f(x)",
			"min":0,
			"max":100,
		},
		"lines":[{
			"name":"time series 1",
			"color":"#4060FF",
		},{
			"name":"time series 2",
			"color":"#E00000",
		}],
		"formatter":(value => nFormatter(value,1)),
	};
*/
export default class BarPlot {
    constructor(name, model) {
        this.name = name;
        this.model = model;
        this.htmlfield = document.getElementById(name);
        this.color = window.getComputedStyle(this.htmlfield).color;
        if (!this.color) {
            this.color = '#000000';
        }
        this.bar = document.createElement('div');
        this.bar.setAttribute('id', name + '_bar');
        this.bar.style.width = '50%';
        this.bar.style.height = '100%';
        this.bar.style.backgroundColor = model.lines[0].color;
        this.bar.style.textAlign = 'right';
        this.htmlfield.appendChild(this.bar);
    }

    appendValues(values) {
        this.bar.style.width = Math.floor((1000 * values[0]) / this.model.y_axis.max) / 10 + '%';
        this.bar.innerHTML = "<span id='" + this.name + "_text'>" + Math.floor(values[0]) + '</span>';
        let textsize = document.getElementById(this.name + '_text').offsetWidth;
        console.log(textsize, this.bar.offsetWidth);
        if (this.bar.offsetWidth < textsize) {
            document.getElementById(this.name + '_text').style.display = 'none';
        }
    }
}
