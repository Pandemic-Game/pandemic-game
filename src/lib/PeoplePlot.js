export default class PeoplePlot{
	getPositions(){
		let image = document.createElement("img");
		image.setAttribute("src", "person.png");
		this.context.strokeStyle = "#000000";
		for(let y=0; y<this.height/10; y++){
			for(let x=0; x<(this.width-10)/16; x++){
				this.context.drawImage(image,16*x+8*(y%2)+5,10*y);
				/*this.context.beginPath();
				this.context.moveTo(16*x+8*(y%2)+5,10*y);
				this.context.lineTo(16*x+8*(y%2)+5,10*y+3);
				this.context.stroke();*/
			}
		}
	}
	
	constructor(name,model){
		this.name = name;
		this.model = model;
		this.htmlfield = document.getElementById(name);
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
		this.getPositions();
	}
	
	appendValues(values){
	}
}