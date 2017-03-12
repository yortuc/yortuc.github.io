
function objAttributeDecorator(data){

    data.fabricName = data.fabricName || data.name;

	var attr = {
        fireChange: true,  // whether fire default onChange event or not
        name: data.name,
        title: ko.observable(data.title),
        value: ko.observable(data.value),
        fabricName: data.fabricName,
        type: data.type,
        data: data.data || null,
        items: ko.observableArray(data.items || null),
        template: "edtTmp_" + data.type,
        invalid: ko.observable(false),
        errorMessage: ko.observable(data.errMsg)
    }

    attr.value.subscribe(function(newVal){
        if(!attr.fireChange) return;
        
        if(data.onChange){
            // custom action
            data.onChange(newVal);
        }
        else{
            // default behavior, apply change to the fabric property
            var opt = {};
            opt[data.fabricName] = newVal;
            data.obj.set(opt);
            capsli.canvas.renderAll();
        }
    });

    data.obj.attributes[data.name] = attr;
}