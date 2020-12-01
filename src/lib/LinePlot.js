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
export class LinePlot{
	
	drawAxes(){
		let currentValue;
		let startValue;
		let range;
		let stepssize = 1;
		
		this.context.fillStyle = this.model.backgroundColor;
		this.context.fillRect(40,0,this.width-40,this.height-30);
		
		//draw lines for axis
		this.context.lineWidth = 1;
		this.context.strokeStyle = this.axisColor;
		this.context.fillStyle = this.axisColor;
		this.context.beginPath();
		this.context.moveTo(0,this.height-30);
		this.context.lineTo(this.width-1,this.height-30);
		this.context.stroke();
		this.context.beginPath();
		this.context.moveTo(40,0);
		this.context.lineTo(40,this.height-1);
		this.context.stroke();
		
		//write names of axis
		this.context.font = "12px Arial";
		this.context.fillText(this.model.x_axis.name, this.width-6*(this.model.x_axis.name.length) , this.height-3);
		this.context.fillText(this.model.y_axis.name, 5 ,13);
		
		//write values of axis
		range = this.model.x_axis.max-this.model.x_axis.min;
		while((Math.floor(stepssize/range*(this.width-30)))<40){
			stepssize*=10;
		}
		startValue = this.model.x_axis.min-(this.model.x_axis.min%stepssize)+stepssize;
		for(let i1=startValue; i1<this.model.x_axis.max; i1+=stepssize){
			currentValue = Math.floor(40+(i1-this.model.x_axis.min)/range*(this.width-40));
			if(this.model.x_axis.formatter){
				this.context.fillText(this.model.x_axis.formatter(i1), currentValue, this.height-15);
			} else{
				this.context.fillText(i1, currentValue, this.height-15);
			}
			if(this.model.y_axis.line=="dot"){
				this.context.setLineDash([5,5]);
				this.context.beginPath();
				this.context.moveTo(currentValue,15);
				this.context.lineTo(currentValue,this.height-30);
				this.context.stroke();
			}
			if(this.model.x_axis.line=="solid"){
				this.context.beginPath();
				this.context.moveTo(currentValue,15);
				this.context.lineTo(currentValue,this.height-30);
				this.context.stroke();
			}
		}
		stepssize = 1;
		range = this.max_y-this.model.y_axis.min;
		while((Math.floor(stepssize/range*(this.height-30)))<15){
			stepssize*=10;
		}
		startValue = this.model.y_axis.min-(this.model.y_axis.min%stepssize)+stepssize;
		for(let i1=startValue; i1<this.max_y; i1+=stepssize){
			currentValue = this.height-30-Math.floor((i1-this.model.y_axis.min)/range*(this.height-30));
			if(this.model.y_axis.formatter){
				this.context.fillText(this.model.y_axis.formatter(i1), 5, currentValue);
			} else{
				this.context.fillText(i1, 5, currentValue);
			}
			if(this.model.y_axis.line=="dot"){
				this.context.setLineDash([5,5]);
				this.context.beginPath();
				this.context.moveTo(40,currentValue);
				this.context.lineTo(this.width-1,currentValue);
				this.context.stroke();
			}
			if(this.model.y_axis.line=="solid"){
				this.context.beginPath();
				this.context.moveTo(40,currentValue);
				this.context.lineTo(this.width-1,currentValue);
				this.context.stroke();
			}
		}
	}
	
	drawValues(offset,oldvalues,values){
		let current_y;
		let current_x;
		this.context.lineWidth = 2;
		for(let i1=0; i1<values.length; i1++){
			if(i1 == oldvalues.length){
				break;
			}
			this.context.strokeStyle = this.model.lines[i1].color;
			current_y = Math.floor((this.height-30)-(oldvalues[i1]-this.model.y_axis.min)/(this.max_y-this.model.y_axis.min)*(this.height-30));
			current_x = Math.floor(40+(offset-1)/this.model.x_axis.step*(this.width-40));
			this.context.beginPath();
			this.context.moveTo(current_x,current_y);
			current_y = Math.floor((this.height-30)-(values[i1]-this.model.y_axis.min)/(this.max_y-this.model.y_axis.min)*(this.height-30));
			current_x = Math.floor(40+offset/this.model.x_axis.step*(this.width-40));
			this.context.lineTo(current_x,current_y);
			this.context.stroke();
		}
	}
	
	redrawValues(){
		this.context.clearRect(0,0,this.width,this.height);
		this.drawAxes();
		for(let i1=1; i1<this.history.length; i1++){
			this.drawValues(i1,this.history[i1-1],this.history[i1]);
		}
	}
	
	setMousePosition(event){
		let mouseY = event.clientY-this.context.canvas.getBoundingClientRect().top;
		if(mouseY < this.height-30){
			this.mousePosition=this.height-30-mouseY;
		}
		if(!this.stored_y){
			this.stored_y=this.model.y_axis.max;
		}
	}
	
	moveMousePosition(){
		if(this.mousePosition !== null){
			let mouseY = event.clientY-this.context.canvas.getBoundingClientRect().top;
			if(mouseY < this.height-30){
				this.max_y=this.stored_y*this.mousePosition/(this.height-30-mouseY);
				this.redrawValues();
			}
		}
	}
	
	removeMousePosition(){
		this.mousePosition=null;
		this.stored_y=this.max_y;
	}
	
	constructor(name,model){
		this.name = name;
		this.history = [];
		this.model = model;
		this.htmlfield = document.getElementById(name);
		this.axisColor = window.getComputedStyle(this.htmlfield).color;
		this.mousePosition = null;
		this.max_y=model.y_axis.max;
		if(! this.axisColor){
			this.axisColor="#000000";
		}
		let canvas = document.createElement("canvas");
		canvas.setAttribute("id", name+"_canvas");
		if(model.width){
			canvas.style.width = model.width;
		} else{
			canvas.style.width="100%";
		}
		if(model.height){
			canvas.style.height = model.height;
		} else{ 
			canvas.style.height="100%";
		}
		this.htmlfield.appendChild(canvas);
		canvas.width=canvas.clientWidth;
		canvas.height=canvas.clientHeight;
		canvas.addEventListener("mousedown",this.setMousePosition.bind(this));
		canvas.addEventListener("mousemove",this.moveMousePosition.bind(this));
		canvas.addEventListener("mouseup",this.removeMousePosition.bind(this));
		this.width = canvas.clientWidth;
		this.height = canvas.clientHeight;
		this.context = canvas.getContext("2d");
		this.drawAxes();
	}
	
	appendValues(values){
		if(this.max_y != this.model.y_axis.max){
			this.max_y=this.model.y_axis.max;
			this.redrawValues();
		}
		if(this.model.scalable){
			let maxChanged = false;
			for(let i1=0; i1<values.length; i1++){
				while(values[i1]>this.model.y_axis.max){
					this.model.y_axis.max*=2;
					this.max_y=this.model.y_axis.max;
					maxChanged=true;
				}
			}
			if(maxChanged){
				this.context.clearRect(0,0,this.width,this.height);
				this.drawAxes();
				for(let i1=1; i1<this.history.length; i1++){
					this.drawValues(i1,this.history[i1-1],this.history[i1]);
				}
			}
		}
		if(this.history.length == 0){
			this.history.push(values);
			return;
		}
		this.drawValues(this.history.length,this.history[this.history.length-1],values);
		this.history.push(values);
	}
}