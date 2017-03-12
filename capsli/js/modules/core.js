// core.js
var capsli = capsli || {};

(function(){

	var self = {};

	self.canvas = null;

	self.height = 720;

	self.selectedObject = ko.observable();

	self.init = function(){
		self.canvas = objCanvas( "canvas" );
		
		self.canvas.setWidth(800);
		self.canvas.setHeight(600);

		self.canvas.backgroundColor="#fff";
		self.canvas.renderAll();

		self.canvas.on('object:selected', function(options) {
			self.selectedObject(options.target);
			console.log(self.selectedObject());
		});

		self.canvas.on('object:modified', function(options) {
			console.log(options);
		});

		/*
		self.canvas.on('object:rotating', function(options) {
			//self.selectedObject(options.target);
			console.log(options);
		});
		*/

		self.canvas.on('before:selection:cleared', function(data){
			self.selectedObject(null);
		});
	};

	self.setHeight = function(height){
		self.canvas.setHeight(height);
		self.canvas.renderAll();
	};

	self.addObject = function(obj){
		self.canvas.add(obj);				// add obj
		self.canvas.setActiveObject(obj); 	// make it selected
	};

	self.removeObject = function(){

		if(self.selectedObject().objects){
			self.selectedObject().objects.forEach(function(p){
				self.canvas.remove(p);
				self.canvas.renderAll();
			});
		}
		else{
			self.canvas.remove(self.selectedObject());
			self.canvas.renderAll();
		}
	};

	self.bringToFront = function(){
		self.canvas.bringToFront(self.selectedObject());
	};

	self.sendToBack = function(){
		self.canvas.sendToBack(self.selectedObject());
	};

	self.resetAngle = function(){
		capsli.selectedObject().set({ angle: 0});
		capsli.selectedObject().setCoords();
		capsli.canvas.renderAll();
	};

	self.centerX = function(){
		self.canvas.centerObjectH(self.selectedObject());
		self.selectedObject().setCoords();
		self.canvas.renderAll();
	};

	self.centerY = function(){
		self.canvas.centerObjectV(self.selectedObject());
		self.selectedObject().setCoords();
		self.canvas.renderAll();
	};

	self.fitX = function(){
		var cw = self.canvas.getWidth();

		self.selectedObject().set({
			left: cw/2,
			width: cw
		});
		self.selectedObject().setCoords();
		self.canvas.renderAll();
	};

	self.fitY = function(){
		var ch = self.canvas.getHeight();

		self.selectedObject().set({
			top: ch/2,
			height: ch
		});
		self.selectedObject().setCoords();
		self.canvas.renderAll();
	};

	self.placeLeft = function(){
		var w = self.selectedObject().getWidth();

		self.selectedObject().set({ left: w/2 });
		self.selectedObject().setCoords();
		self.canvas.renderAll();
	};

	self.placeRight = function(){
		self.selectedObject().set({
			left: self.canvas.getWidth() - self.selectedObject().getWidth()/2
		});
		self.selectedObject().setCoords();
		self.canvas.renderAll();
	};

	self.placeTop = function(){
		self.selectedObject().set({ top: self.selectedObject().getHeight()/2 });
		self.selectedObject().setCoords();
		self.canvas.renderAll();
	};

	self.placeBottom = function(){
		self.selectedObject().set({
			top: self.canvas.getHeight() - self.selectedObject().getHeight()/2
		});
		self.selectedObject().setCoords();
		self.canvas.renderAll();
	};

	var ob = capsli.objBase;
	capsli = self;
	capsli.objBase = ob;
	self.init();		// init module
})();
