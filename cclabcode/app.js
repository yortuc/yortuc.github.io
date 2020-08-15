const value = "// ctx is injected\n\nctx.fillRect(0, 0, 100, 100);\n\n";
const language = "javascript";

const model = monaco.editor.createModel(value, language)

var editor = monaco.editor.create(document.getElementById('code-panel'), {
	value: value,
	language: language,
	glyphMargin: true
});

editor.setModel(model);

model.onDidChangeContent(() => {
  const code = model.getValue();
  runCode(code);

  if(!DONT_REFRESH){
  	saveCode(code);
  }
});

	
//----------------------------------

let DONT_REFRESH = false;

const ctx = document.getElementById("canvas").getContext("2d")

function saveCode(code){
  localStorage.setItem('cclab_code', code);

  const viewState = editor.saveViewState();
  localStorage.setItem('cclab_viewstate', JSON.stringify(viewState))
}

function loadCode(){
  return localStorage.getItem('cclab_code')
}

function runCode(code){
	try{
    	const funcCreateObj = new Function("ctx", code)
    	const obj = funcCreateObj(ctx)
    	document.getElementById("indicator").style.backgroundColor = "rgb(0,230,23)";
  	}
  	catch (error){
  		const err = extractErrorInfo(error);
  		console.log(err);

  		document.getElementById("indicator").style.backgroundColor = "rgb(243, 12,34)";
  	}
}

function extractErrorInfo(err){
	const start = err.stack.indexOf("<anonymous>:")
	const end = err.stack.indexOf(")", start+11);
	const str = err.stack.substr(start+12, end-1).split(":");

	return {
		message: err.message,
		lineNumber: str[0]-2,
		columnNumber: str[1]
	}
}

const savedCode = loadCode();
if (savedCode) {
	DONT_REFRESH = true;
	model.setValue(savedCode);
	DONT_REFRESH = false;
  	
  	const viewState = localStorage.getItem('cclab_viewstate');
  	if (viewState){
  		editor.restoreViewState(JSON.parse(viewState));
  	}
}


