/*
This file contains all classes for frontend components.
*/

export default class Plot{
	
	drawAxes(){
		let currentValue;
		let startValue;
		let stepssize = 1;
		
		//draw lines for axis
		this.context.strokeStyle = this.axisColor;
		this.context.fillStyle = this.axisColor;
		this.context.beginPath();
		this.context.moveTo(0,this.height-30);
		this.context.lineTo(this.width-1,this.height-30);
		this.context.stroke();
		this.context.beginPath();
		this.context.moveTo(40,15);
		this.context.lineTo(40,this.height-1);
		this.context.stroke();
		
		//write names of axis
		this.context.font = "12px Arial";
		this.context.fillText(this.model.x_axis.name, this.width-6*(this.model.x_axis.name.length) , this.height-3);
		this.context.fillText(this.model.y_axis.name, 5 ,13);
		
		//write values of axis
		while((Math.floor(stepssize/(this.model.x_axis.end-this.model.x_axis.start)*(this.width-30)))<40){
			stepssize*=10;
		}
		startValue = this.model.x_axis.start-(this.model.x_axis.start%stepssize)+stepssize;
		for(let i1=startValue; i1<this.model.x_axis.end; i1+=stepssize){
			currentValue = Math.floor(40+(i1-this.model.x_axis.start)/(this.model.x_axis.end-this.model.x_axis.start)*(this.width-40));
			this.context.fillText(this.model.formatter(i1), currentValue, this.height-15);
		}
		stepssize = 1;
		while((Math.floor(stepssize/(this.model.y_axis.end-this.model.y_axis.start)*(this.height-30)))<15){
			stepssize*=10;
		}
		startValue = this.model.y_axis.start-(this.model.y_axis.start%stepssize)+stepssize;
		for(let i1=startValue; i1<this.model.y_axis.end; i1+=stepssize){
			currentValue = this.height-30-Math.floor((i1-this.model.y_axis.start)/(this.model.y_axis.end-this.model.y_axis.start)*(this.height-30));
			this.context.fillText(this.model.formatter(i1), 5, currentValue);
		}
	}
	
	constructor(name,model){
		this.name = name;
		this.history = [];
		this.model = model;
		this.htmlfield = document.getElementById(name);
		this.axisColor = window.getComputedStyle(this.htmlfield).color;
		if(! this.axisColor){
			this.axisColor="#000000";
		}
		let canvas = document.createElement("canvas");
		canvas.setAttribute("id", name+"_canvas");
		canvas.style.width="100%";
		canvas.style.height="100%";
		canvas.width=this.htmlfield.offsetWidth;
		canvas.height=this.htmlfield.offsetHeight;
		this.htmlfield.appendChild(canvas);
		this.width = canvas.clientWidth;
		this.height = canvas.clientHeight;
		this.context = canvas.getContext("2d");
		this.drawAxes();
	}
	
	appendValues(values){
		if(this.history.length == 0){
			this.history.push(values);
			return;
		}
		let oldvalues = this.history[this.history.length-1];
		let current_y;
		let current_x;
		this.context.lineWidth = 2;
		for(let i1=0; i1<values.length; i1++){
			if(i1 == oldvalues.length){
				break;
			}
			this.context.strokeStyle = this.model.lines[i1].color;
			current_y = Math.floor((this.height-30)-(oldvalues[i1]-this.model.y_axis.start)/(this.model.y_axis.end-this.model.y_axis.start)*(this.height-30));
			current_x = Math.floor(40+(this.history.length-1)/this.model.steps*(this.width-40));
			this.context.beginPath();
			this.context.moveTo(current_x,current_y);
			current_y = Math.floor((this.height-30)-(values[i1]-this.model.y_axis.start)/(this.model.y_axis.end-this.model.y_axis.start)*(this.height-30));
			current_x = Math.floor(40+this.history.length/this.model.steps*(this.width-40));
			this.context.lineTo(current_x,current_y);
			this.context.stroke();
		}
		this.history.push(values);
	}
}