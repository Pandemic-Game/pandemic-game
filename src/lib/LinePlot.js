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
	 - series: array of objects with name, color
	 - formatter: fuction to parse int to string
	 
	example:
	HTML-code:
	<div id="plot_id" class="plot"></div>
	
	JS-code:
	let model_humans = {
		"xAxis":{
			"name":"x",
			"min":0,
			"max":100,
			"step":10,
		},
		"yAxis":{
			"name":"f(x)",
			"min":0,
			"max":100,
		},
		"series":[{
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
		
		//draw series for axis
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
		this.context.fillText(this.model.xAxis.name, this.width-6*(this.model.xAxis.name.length) , this.height-3);
		this.context.fillText(this.model.yAxis.name, 5 ,13);
		
		//write values of axis
		range = this.model.xAxis.max-this.model.xAxis.min;
		while((Math.floor(stepssize/range*(this.width-30)))<40){
			stepssize*=10;
		}
		startValue = this.model.xAxis.min-(this.model.xAxis.min%stepssize);
		if(!this.model.xAxis.intervall){
			startValue+=stepssize;
		}
		if(this.model.xAxis.lineColor){
			this.context.strokeStyle = this.model.xAxis.lineColor;
		} else{
			this.context.strokeStyle = this.axisColor;
		}
		this.context.textAlign = "center"; 
		for(let i1=startValue; i1<this.model.xAxis.max; i1+=stepssize){
			if(this.model.xAxis.intervall){
				currentValue = Math.floor(40+(i1+stepssize/2-this.model.xAxis.min)/range*(this.width-40));
			} else{
				currentValue = Math.floor(40+(i1-this.model.xAxis.min)/range*(this.width-40));
			}
			if(this.model.xAxis.formatter){
				this.context.fillText(this.model.xAxis.formatter(i1), currentValue, this.height-15);
			} else{
				this.context.fillText(i1, currentValue, this.height-15);
			}
			currentValue = Math.floor(40+(i1-this.model.xAxis.min)/range*(this.width-40));
			if(this.model.xAxis.line=="dot"){
				this.context.save();
				this.context.setLineDash([5,5]);
				this.context.beginPath();
				this.context.moveTo(currentValue,0);
				this.context.lineTo(currentValue,this.height-30);
				this.context.stroke();
				this.context.restore();
			}
			if(this.model.xAxis.line=="solid"){
				this.context.beginPath();
				this.context.moveTo(currentValue,0);
				this.context.lineTo(currentValue,this.height-30);
				this.context.stroke();
			}
		}
		stepssize = 1;
		range = this.max_y-this.model.yAxis.min;
		while((Math.floor(stepssize/range*(this.height-30)))<15){
			stepssize*=10;
		}
		startValue = this.model.yAxis.min-(this.model.yAxis.min%stepssize)+stepssize;
		if(this.model.yAxis.lineColor){
			this.context.strokeStyle = this.model.yAxis.lineColor;
		} else{
			this.context.strokeStyle = this.axisColor;
		}
		this.context.textAlign = "end"; 
		for(let i1=startValue; i1<this.max_y; i1+=stepssize){
			currentValue = this.height-30-Math.floor((i1-this.model.yAxis.min)/range*(this.height-30));
			if(this.model.yAxis.formatter){
				this.context.fillText(this.model.yAxis.formatter(i1), 35, currentValue+5);
			} else{
				this.context.fillText(i1, 35, currentValue);
			}
			if(this.model.yAxis.line=="dot"){
				this.context.save();
				this.context.setLineDash([5,5]);
				this.context.beginPath();
				this.context.moveTo(40,currentValue);
				this.context.lineTo(this.width-1,currentValue);
				this.context.stroke();
				this.context.restore();
			}
			if(this.model.yAxis.line=="solid"){
				this.context.beginPath();
				this.context.moveTo(40,currentValue);
				this.context.lineTo(this.width-1,currentValue);
				this.context.stroke();
			}
		}
		this.context.strokeStyle = this.axisColor;
	}
	
	drawValues(offset,oldvalues,values){
		let current_y;
		let current_x;
		for(let i1=0; i1<values.length; i1++){
			if(this.model.series[i1].width){
				this.context.lineWidth = this.model.series[i1].width;
			} else{
				this.context.lineWidth = 2;
			}
			if(i1 == oldvalues.length){
				break;
			}
			this.context.strokeStyle = this.model.series[i1].color;
			current_y = Math.floor((this.height-30)-(oldvalues[i1]-this.model.yAxis.min)/(this.max_y-this.model.yAxis.min)*(this.height-30));
			current_x = Math.floor(40+(offset-1)/this.model.xAxis.step*(this.width-40));
			this.context.beginPath();
			this.context.moveTo(current_x,current_y);
			current_y = Math.floor((this.height-30)-(values[i1]-this.model.yAxis.min)/(this.max_y-this.model.yAxis.min)*(this.height-30));
			current_x = Math.floor(40+offset/this.model.xAxis.step*(this.width-40));
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
			this.stored_y=this.model.yAxis.max;
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
		this.max_y=model.yAxis.max;
		if(! this.axisColor){
			this.axisColor="#000000";
		}
		let canvas = document.createElement("canvas");
		canvas.setAttribute("id", name+"_canvas");
		if(model.width){
			canvas.style.width = model.width;
		} else{
			canvas.style.width = "100%";
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
		window.addEventListener("mouseup",this.removeMousePosition.bind(this));
		this.width = canvas.clientWidth;
		this.height = canvas.clientHeight;
		this.context = canvas.getContext("2d");
		this.drawAxes();
	}
	
	appendValues(values){
		if(this.max_y != this.model.yAxis.max){
			this.max_y=this.model.yAxis.max;
			this.stored_y=null;
			this.redrawValues();
		}
		if(this.model.scalable){
			let maxChanged = false;
			for(let i1=0; i1<values.length; i1++){
				while(values[i1]>this.model.yAxis.max){
					this.model.yAxis.max*=2;
					this.max_y=this.model.yAxis.max;
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
