function objCanvas(canvasId){
	
	var self = new fabric.Canvas(canvasId);

	self.editorTemplate = "edtTmp_canvas";

	self.attributes = {};

	objAttributeDecorator({
		obj: self,
		name: "backgroundColor",
		value: "#ffffff",
		onChange: function(val){
			self.setBackgroundColor(val);
			self.renderAll();
		}
	});

	objAttributeDecorator({
		obj: self,
		name: "width",
		value: 800,
		onChange: function(val){
			self.setWidth(val);
			resizeCanvasCss({width: val});
			self.renderAll();
		}
	});

	objAttributeDecorator({
		obj: self,
		name: "height",
		value: 600,
		onChange: function(val){
			self.setHeight(val);
			resizeCanvasCss({height: val});
			self.renderAll();
		}
	});

	function resizeCanvasCss(data){
		// set size of element, in this case, an image
  		// $('#main').css('width', param.width);
  		
  		// set size of div created by resizable class, used to position handles
  		data.width && $('#main .ui-wrapper').css({ width : data.width });
  		data.height && $('#main .ui-wrapper').css({ height : data.height });
	}

	self.fitCanvas = function(){
		var objects = self.getObjects(),
			wmax = 0, 
			hmax = 0, 
			w = 0, 
			h = 0,
			left = 0,
			lmin = 5000,
			top = 0,
			tmin = 5000;
		
		if(objects.length === 0){
			alert("içerik olmadığı için boyutlandırılamadı.");
			return;
		}

		// get the canvas size
		objects.forEach(function(p){
			left = p.getLeft() - p.getWidth()/2;
			top = p.getTop() - p.getHeight()/2;
			w = left + p.getWidth();
			h = top + p.getHeight();

			if(w > wmax) wmax = w;
			if(h > hmax) hmax = h;
			if(left < lmin) lmin = left;
			if(top < tmin) tmin = top;
		});

		// shift objects to left in order to erase empy space on the left-side
		objects.forEach(function(p){
			p.setLeft( p.getLeft() - lmin );
			p.setTop( p.getTop() - tmin );
			p.setCoords();
		});

		w = wmax-lmin;
		h = hmax-tmin;

		self.setWidth( w );
		self.setHeight( h );
		resizeCanvasCss({width: w, height: h});
		self.renderAll();
	};

	return self;
};