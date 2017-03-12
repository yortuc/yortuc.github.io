function objText(opt){
	
	var self = this;

	opt = opt || {};

	self.type = "text";
	self.editorTemplate = "edtTmp_txt";

	self.style = {
		toggle: function(item){
			self.style[item]( !self.style[item]() );
		},
		bold: ko.observable(false),
		italic: ko.observable(false),
		underline: ko.observable(false),
		textAlign: ko.observable('left')
	};

	self.style.bold.subscribe(function(val){
		self.set({ fontWeight: val ? 'bold' : 'normal' });
		capsli.canvas.renderAll();
	});

	self.style.italic.subscribe(function(val){
		self.set({ fontStyle: val ? 'oblique' : ''  });
		capsli.canvas.renderAll();
	});

	self.style.underline.subscribe(function(val){
		self.set({ textDecoration: val ? 'underline' : '' });
		capsli.canvas.renderAll();
	});

	self.toggleTextAlign = function(align){
		self.style.textAlign(align);
		self.set({ textAlign : align });
		capsli.canvas.renderAll();
	};

	self.attributes = {};

	self.attributes.fonts = ko.observableArray([
		"arial", 
		"times new roman",
		"verdana",
		"helvetica",
		"georgia",
		"courier",
		"comic sans ms"
	]);

	objAttributeDecorator({
		obj: self,
		name: "textAlign",
		value: opt.textAlign || "left"
	});

	// text
	objAttributeDecorator({
		obj: self,
		name: "text",
		value: opt.text || "caps.li"
	});

	// font-size
	objAttributeDecorator({
		obj: self,
		name: "fontSize",
		value: opt.fontSize || 40
	});
	
	//color
	objAttributeDecorator({
		obj: self,
		name: "fill",
		value: opt.fill || "#000000"
	});

 	// font
	objAttributeDecorator({
		obj: self,
		name: "fontFamily",
		value: opt.fontFamily || "times new roman"
	});	 

	self.set({
		text: opt.text || 'caps.li!',
		textAlign: 'left',
		lockScalingX : true,
		lockScalingY : true,

		left: opt.left || capsli.canvas.getWidth()/2 + (100 * Math.random()), 
		top: opt.top || capsli.canvas.getHeight()/2 + (100 * Math.random()),
		fontSize: opt.fontSize || 40,
		fontFamily: opt.fontFamily || "times new roman",
		fill: opt.fill || "#000",
		textAlign: opt.textAlign || "left"
	});
};

objText.prototype = new fabric.Text("", capsli.objBase);