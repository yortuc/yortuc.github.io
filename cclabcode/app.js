class Editor{
  constructor(){
    this.DONT_REFRESH = false;

    const value = "// ctx is injected\n\nctx.fillRect(0, 0, 100, 100);\n\n";
    const language = "javascript";

    this.drawingMapper = new DrawingMapper();
    this.model = monaco.editor.createModel(value, language)

    this.editor = monaco.editor.create(document.getElementById('code-panel'), {
      value: value,
      language: language,
      glyphMargin: true
    });

    this.editor.setModel(this.model);
    
    this.editor.onDidChangeCursorPosition(this.onDidChangeCursorPosition.bind(this));
    this.model.onDidChangeContent(this.onDidChangeContent.bind(this));
  }

  onDidChangeCursorPosition(e){
    console.log(e);
    highlightCanvas(this.drawingMapper.calls, e.position.lineNumber);
  }

  onDidChangeContent(){
    const code = this.model.getValue();
    this.runCode(code);

    if(!this.DONT_REFRESH){
      this.saveCode(code);
    }
  }

  saveCode(code){
    localStorage.setItem('cclab_code', code);

    const viewState = editor.saveViewState();
    localStorage.setItem('cclab_viewstate', JSON.stringify(viewState))
  }

  loadCode(){
    return localStorage.getItem('cclab_code')
  }

  draw(){
    this.runCode(this.model.getValue());
  }

  runCode(code){
    try{
        const funcCreateObj = new Function("ctx", code)
        this.drawingMapper = new DrawingMapper()
        const ctx = this.drawingMapper.getCtx()
        const obj = funcCreateObj(ctx)
        document.getElementById("indicator").style.backgroundColor = "rgb(0,230,23)";
      }
      catch (error){
        const err = extractErrorInfo(error);
        console.log(err);
        document.getElementById("indicator").style.backgroundColor = "rgb(243, 12,34)";
      }
  }

  start(){
    const savedCode = this.loadCode();
    if (savedCode) {
      this.DONT_REFRESH = true;
      this.model.setValue(savedCode);
      this.DONT_REFRESH = false;
        
        const viewState = localStorage.getItem('cclab_viewstate');
        if (viewState){
          this.editor.restoreViewState(JSON.parse(viewState));
        }
    }  
  }
}
	
//----------------------------------

const context = document.getElementById("canvas").getContext("2d");

// Wrap drawing context
class DrawingMapper{
  constructor(){
    this.calls = []
  }
  getCtx(){
    // all the ctx api has to be wrapped :\
    return {
      fillRect: (x,y,w,h) => {
        this.calls.push({
          lineNumber: this.getLine(new Error()),
          x,y,w,h
        })

        context.fillRect(x,y,w,h)
        console.log(this.calls)
      }
    }
  }
  getLine(err){
    const start = err.stack.indexOf("<anonymous>:")
    const end = err.stack.indexOf(")", start+11);
    const str = err.stack.substr(start+12, end-1).split(":");
    return str[0]-2;
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


const editor = new Editor()

editor.start();

function highlightCanvas(mappings, curLine){
  context.clearRect(0, 0, 800, 600);
  editor.draw();

  const curMaps = mappings.filter(m => m.lineNumber == curLine)
  
  console.log(curMaps.length)

  curMaps.forEach(m => {
    console.log(m);
    context.save()
    context.strokeStyle = "red";
    context.lineWidth = 3;

    context.rect(m.x, m.y, m.w, m.h)
    context.stroke()
    context.restore()
  });

}