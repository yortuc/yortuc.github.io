function objImg(img){
	
	var self = new fabric.Image(capsli.objBase);

	self.type = "img";
	self.editorTemplate = "edtTmp_img";

	/*
	objAttributeDecorator({
		obj: self,
		name: "angle",
		value: 0,
		onChange: function(val){
			capsli.selectedObject.setAngle(val);
			capsli.canvas.renderAll();
		}
	});
	*/

	return self;
};