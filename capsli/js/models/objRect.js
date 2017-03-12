function objRect(opt){
	
	var self = this;

	opt = opt || {};

	self.type = "rect";
	self.editorTemplate = "edtTmp_rect";

	self.attributes = {};

	//color
	objAttributeDecorator({
		obj: self,
		name: "fill",
		value: opt.fill || "#ff0000"
	});

	// opacity
	objAttributeDecorator({
		obj: self,
		name: "opacity",
		value: opt.opacity || 1
	});

	// init
	self.set({
		left: opt.left || 100,
		top: opt.top || 100,

		fill: opt.fill || '#ff0000',
		width: opt.width || 140,
		height: opt.height || 60

		/*,shadow: new fabric.Shadow({
			color: 'rgba(0,0,0,0.3)',
			blur: 10,
			offsetX: 10,
			offsetY: 10
		})*/
	});
};

objRect.prototype = new fabric.Rect(capsli.objBase);