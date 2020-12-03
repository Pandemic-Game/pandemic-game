export default class PeoplePlot{
	getPositions(){
		this.positions = [];
		for(let y=0; y<this.height/10; y++){
			for(let x=0; x<(this.width-10)/16; x++){
				this.positions.push([16*x+8*(y%2)+5,10*y]);
			}
		}
		this.stepsize = 10**Math.ceil(Math.log10(this.model.y_axis.max/this.positions.length));
	}
	
	getFigure(){
		let image = document.createElement("img");
		image.setAttribute("src", "person.png");
		let imagecanvas = document.createElement("canvas");
		imagecanvas.width=image.width;
		imagecanvas.height=image.height;
		let context = imagecanvas.getContext("2d");
		let color;
		let red;
		let green;
		let blue;
		context.drawImage(image,0,0);
		let imdata = context.getImageData(0, 0, imagecanvas.width, imagecanvas.height);
		let datacopy;
		for(let i1=0; i1<this.model.lines.length; i1++){
			color = parseInt(this.model.lines[i1].color.substr(1),16);
			red = (color>>16)&255;
			green = (color>>8)&255;
			blue = color & 255;
			datacopy = new Uint8ClampedArray(imdata.data);
			for(let i2=0; i2<imdata.data.length/4; i2++){
				datacopy[4*i2]=imdata.data[4*i2+1]+Math.floor(red*(255-imdata.data[4*i2+1]+imdata.data[4*i2])/255);
				datacopy[4*i2+1]=imdata.data[4*i2+1]+Math.floor(green*(255-imdata.data[4*i2+1]+imdata.data[4*i2])/255);
				datacopy[4*i2+2]=imdata.data[4*i2+1]+Math.floor(blue*(255-imdata.data[4*i2+1]+imdata.data[4*i2])/255);
				datacopy[4*i2+3]=255;
			}
			this.model.lines[i1].imageData = new ImageData(datacopy,imdata.width,imdata.height);
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
		this.getFigure();
	}
	
	appendValues(values){
		let personsCount;
		let offset=0;
		this.context.clearRect(0,0,this.width,this.height);
		for(let i1=0; i1<values.length; i1++){
			personsCount=Math.floor(values[i1]/this.stepsize);
			for(let i2=0; i2<personsCount; i2++){
				if(this.positions.length <= (i2+offset)){
					return;
				}
				this.context.putImageData(this.model.lines[i1].imageData,this.positions[i2+offset][0],this.positions[i2+offset][1]);
			}
			offset+=personsCount;
		}
	}
}
