

function Swipe(obj){
	this.id = obj.id;
	this.cas = document.getElementById(this.id);
	this.context = this.cas.getContext("2d");
	this._w = obj._w;
	this._h = obj._h;
	this.radius = obj.radius;
	this.coverType = obj.coverType;
	this.mask = obj.mask;
	this.percent = obj.percent;
	this.callback = obj.callback;//用户自定义的函数名
	this.posX = 0;
	this.posY = 0;
	this.isMouseDown = false;
	// 先调用初始化方法
	this.init();
	// 添加事件
	this.addEvent();
}
// 设置canvas的图形组合方式，并填充指定的颜色
Swipe.prototype.init = function(){
	// 如果covertype是颜色
	if(this.coverType === "color"){
		this.context.fillStyle=this.mask;
		this.context.fillRect(0,0,this._w,this._h);
		this.context.globalCompositeOperation = "destination-out";
	}
	// 如果covertype是图片
	if(this.coverType === "img"){
		var img01 = new Image();
		img01.src = this.mask;
		var that = this;
		img01.onload = function(){
			that.context.drawImage(img01,0,0,img01.width,img01.height,0,0,that._w,that._h);
			that.context.globalCompositeOperation = "destination-out";
		};
	}
};
// 添加自定义监听事件，PC端为mousedown,mousemove,移动端为touchstart,touchmove
Swipe.prototype.addEvent = function(){
	// 判断移动设备还是PC端，true为移动端,false为pc端
	console.log(window.navigator.userAgent);
	this.device = (/android|webos|iPhone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
	this.clickEvent = this.device?"touchstart":"mousedown";
	this.moveEvent = this.device?"touchmove":"mousemove";
	this.endEvent = this.device?"touchend":"mouseup";
	// 添加鼠标点击或手机点击事件
	var that = this;
	this.cas.addEventListener(this.clickEvent,function(evt){
		var event = evt || window.event;
		// 获取鼠标点击或手指点击时的视口坐标
		that.posX = that.device?event.touches[0].clientX:event.clientX;
		that.posY = that.device?event.touches[0].clientY:event.clientY;
		// 点击时调用画圆的方法
		that.drawArc(that.posX,that.posY);
		that.isMouseDown = true; //鼠标按下
	});
	this.cas.addEventListener(this.moveEvent,function(evt){
		if( !that.isMouseDown ){
			return false;
		}else{
			var event = evt || window.event;
			var x2 = that.device?event.touches[0].clientX:event.clientX;
			var y2 = that.device?event.touches[0].clientY:event.clientY; 
			// 调用canvas画线，将鼠标移动时坐标作为lineTo()参数传入。注意上一次点击时的坐标点作为画线的起始坐标
			that.drawLine(that.posX,that.posY,x2,y2);
			//鼠标边移动边画线，因此需要把上一次移动的点作为下一次画线的起始点
			that.posX = x2;
			that.posY = y2;		
		}
	});
	this.cas.addEventListener(this.endEvent,function(evt){
		that.isMouseDown = false; //鼠标未按下
		//检测透明点的个数
		var n = that.getPercent();
		that.callback.call(window,n);
		if( n > that.percent ){
			that.context.clearRect(0,0,that._w,that._h);
		}
	});
};
Swipe.prototype.drawArc = function(x1,y1){
	this.context.save();
	this.context.beginPath();
	this.context.arc(x1,y1,this.radius,0,2*Math.PI);
	this.context.fillStyle = "red";
	this.context.fill();
	this.context.stroke();
	this.context.restore();
};
Swipe.prototype.drawLine = function(x1,y1,x2,y2){
	this.context.save();
	this.context.beginPath();
	this.context.moveTo(x1,y1);
	this.context.lineTo(x2,y2);
	this.context.lineWidth = this.radius*2;  //笔刷线条的大小
	this.context.lineCap = "round"; // 连接点效果为圆的
	this.context.strokeStyle = "red"; //笔刷的颜色
	this.context.stroke();	
	this.context.restore();
};
// 获取透明点占总像素点的百分比
Swipe.prototype.getPercent = function(){
	this.num= 0;
	this.imgData = this.context.getImageData(0,0,this._w,this._h);
	for (var i = 0; i < this.imgData.data.length; i+=4) {
		if( this.imgData.data[i+3] === 0){
			this.num++;
		}
	}
	this.transpercent = (this.num/(this._w*this._h))*100;
	console.log( "透明点占总面积的百分比："+ this.transpercent.toFixed(2) + "%" );
	return this.transpercent;
};
var obj = {
	id:"cas",//canvas的id
	_w:"375",//canvas的宽
	_h:"667",//canvas的高
	radius:"20",//canvas的擦除圆点的半径
	coverType:"img",
	// canvas的覆盖类型，可以有两种取值img或color，
	// img则需在mask中指定图片的路径,如果是color则需
	// 在mask中给出颜色值，可以是字符串或16进制rbg()
	mask:"images/wipe2.jpg",
	percent:50,
	callback:wancheng//用户自定义回调函数名称
};
var swipe1 = new Swipe(obj);
function wancheng(transpercent){
	// transpercent为透明面积的百分比
	// 擦出完成后，用户自己的逻辑
	if(transpercent > 50){
		alert("擦除完成，查看抽奖结果");
	}
}