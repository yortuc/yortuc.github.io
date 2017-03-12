(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/evox/Google Drive/yortuc/side projects/carkifelek/src/js/Audio.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _BufferLoader = require('./BufferLoader');

var _BufferLoader2 = _interopRequireDefault(_BufferLoader);

function Audio() {}

Audio.prototype.init = function () {
	try {
		// Fix up for prefixing
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		this.context = new AudioContext();
	} catch (e) {
		console.log('Bu browser Web Audio API desteklemiyor. Ses devre dışı.');
		return;
	}

	var bufferLoader = new _BufferLoader2['default'](this.context, ['images/wheel.mp3', 'images/win.mp3'], this.finishedLoading.bind(this));

	bufferLoader.load();
};

Audio.prototype.finishedLoading = function (bufferList) {
	console.log(bufferList);
	this.bufferList = bufferList;
};

Audio.prototype.play = function () {

	// sourceNode
	var source = this.context.createBufferSource();
	source.buffer = this.bufferList[0];

	// Create a gain node.
	this.gainNode = this.context.createGain();
	this.gainNode.gain.value = 1;

	source.connect(this.gainNode);
	this.gainNode.connect(this.context.destination);

	source.start(0);
};

Audio.prototype.setRate = function (volRate) {
	this.gainNode.gain.value *= volRate;
};

Audio.prototype.stop = function () {
	this.gainNode.gain.value = 0;
};

Audio.prototype.playWin = function () {
	// sourceNode
	var source = this.context.createBufferSource();
	source.buffer = this.bufferList[1];
	source.connect(this.context.destination);
	source.start(0);
};

exports['default'] = Audio;
module.exports = exports['default'];


},{"./BufferLoader":"/Users/evox/Google Drive/yortuc/side projects/carkifelek/src/js/BufferLoader.js"}],"/Users/evox/Google Drive/yortuc/side projects/carkifelek/src/js/BufferLoader.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function (url, index) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function () {
        loader.context.decodeAudioData(request.response, function (buffer) {
            if (!buffer) {
                alert('error decoding file data: ' + url);
                return;
            }
            loader.bufferList[index] = buffer;
            if (++loader.loadCount == loader.urlList.length) loader.onload(loader.bufferList);
        });
    };

    request.onerror = function () {
        alert('BufferLoader: XHR error');
    };

    request.send();
};

BufferLoader.prototype.load = function () {
    for (var i = 0; i < this.urlList.length; ++i) this.loadBuffer(this.urlList[i], i);
};

exports["default"] = BufferLoader;
module.exports = exports["default"];


},{}],"/Users/evox/Google Drive/yortuc/side projects/carkifelek/src/js/Cark_pixi.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _resources = require("./resources");

var _resources2 = _interopRequireDefault(_resources);

var _Audio = require("./Audio");

var _Audio2 = _interopRequireDefault(_Audio);

function Cark(data) {
  data = data || {};

  this.slices = data.slices;
  this.turnOnce = data.turnOnce;
  this.onDragFinished = data.onDragFinished;
  this.onWin = data.onWin;
  this.iconScale = data.iconScale || 0.3;
  this.friction = data.friction || 0.018;
  this.dumping = data.dumping || 0.00008;

  this.canvas = document.getElementById(data.canvasId);

  this.init();
}

Cark.prototype.init = function () {
  this.isTurning = false;
  this.turningDirection = 0;
  this.theta = 0;
  this.omega = 0;
  this.won = false;

  this.rect = this.canvas.getBoundingClientRect();
  this.radius = 0.9 * this.rect.width / 2;

  this.radPerSlice = 2 * Math.PI / this.slices.length; // radians per slice
  this.centerPoint = { x: this.rect.width / 2, y: this.rect.height / 2 };
  this.lastUpdate = null;

  // mouse positions
  this.prevP = { x: 0, y: 0 };
  this.p = null; // current mouse pos
  this.p1 = null; // mouseDown position
  this.p2 = null; // mouseUp position
  this.isDown = false;

  // zamanlar
  this.t1 = null;
  this.t2 = null;
  this.mouseVelocity = 0;

  // audio handler
  this.audio = new _Audio2["default"]();
  this.audio.init();

  // init event listeners
  this.canvas.onmousedown = (function (e) {
    if (this.isTurning) return;
    if (this.won && this.turnOnce === true) return;

    this.t1 = Date.now();
    this.p1 = this.toLocalCoords(e.clientX, e.clientY);
    this.isDown = true;
  }).bind(this);

  this.canvas.onmouseup = (function (e) {
    if (this.isTurning) return;

    this.t2 = Date.now();
    this.p2 = this.toLocalCoords(e.clientX, e.clientY);

    if (this.isDown && this.onDragFinished && !this.isTurning) {
      this.turnCark(this.p2, this.p1, this.t2, this.t1);
    }

    this.isDown = false;
  }).bind(this);

  this.canvas.onmousemove = (function (e) {
    if (this.isTurning) return;

    var p = this.toLocalCoords(e.clientX, e.clientY);
    this.p = p;

    // dragging the wheel
    if (this.isDown) {

      var theta1 = Math.atan2(this.p.y, this.p.x);
      var theta2 = Math.atan2(this.prevP.y, this.prevP.x);
      var dTheta = theta2 - theta1;

      this.turningDirection = Math.sign(dTheta);

      this.theta += dTheta;

      var _theta = (this.theta + Math.PI / 2 + this.radPerSlice / 2) % (2 * Math.PI);
      var winIndex = Math.floor(12 * _theta / (2 * Math.PI));

      console.log(this.theta, _theta, winIndex, this.slices[(12 - winIndex) % 12]);
    }

    this.prevP = p;
    this.prevTime = Date.now();
  }).bind(this);

  this.canvas.onmouseout = (function (e) {
    if (this.isTurning) return;

    var pOut = this.toLocalCoords(e.clientX, e.clientY);

    if (!this.isTurning && this.isDown) {
      this.turnCark(pOut, this.p1, Date.now(), this.t1);
      this.isDown = false;
    }
  }).bind(this);

  this.initRenderer();
};

Cark.prototype.initRenderer = function () {

  this.stage = new PIXI.Container();

  // cark
  this.stageCark = new PIXI.Container();
  this.stageCark.pivot.set(this.centerPoint.x, this.centerPoint.y);
  this.stageCark.position.set(this.centerPoint.x, this.centerPoint.y);

  this.renderer = PIXI.autoDetectRenderer(this.rect.width, this.rect.height, { view: this.canvas, transparent: true, antialias: true });

  this.analyseText();

  // create slices
  for (var i = 0; i < this.slices.length; i++) {
    var gSlice = new PIXI.Graphics();
    gSlice.beginFill(this.slices[i].bgColor);
    gSlice.lineStyle(2, 0xffffff, 1);

    var startingAngle = i * this.radPerSlice - this.radPerSlice / 2;
    var endingAngle = startingAngle + this.radPerSlice;

    gSlice.moveTo(this.centerPoint.x, this.centerPoint.y);
    gSlice.arc(this.centerPoint.x, this.centerPoint.y, this.radius, startingAngle, endingAngle);
    gSlice.lineTo(this.centerPoint.x, this.centerPoint.y);

    gSlice.endFill();

    this.stageCark.addChild(gSlice);

    this.createSliceText(i, this.stageCark);
    this.placeSliceIcon(i, this.stageCark);

    this.slices[i].graphics = gSlice;
  };
  this.stage.addChild(this.stageCark);

  // dil
  var dilTexture = PIXI.Texture.fromImage('images/peg.png');
  this.dil = new PIXI.Sprite(dilTexture);
  this.dil.anchor.set(0.5, 0.2);
  this.dil.scale.set(0.8, 0.8);
  this.dil.position.set(this.centerPoint.x, 15);
  this.stage.addChild(this.dil);

  // turn button
  this.btnPasifTexture = PIXI.Texture.fromImage('images/button_pasif.png');
  this.btnAktifTexture = PIXI.Texture.fromImage('images/button_aktif.png');
  this.button = new PIXI.Sprite(this.btnPasifTexture);
  this.button.interactive = true;
  this.button.buttonMode = true;
  this.button.anchor.set(0.5, 0.5);
  this.button.position.set(this.centerPoint.x, this.centerPoint.y);
  this.button.on("mouseover", (function () {
    this.button.texture = this.btnAktifTexture;
  }).bind(this));
  this.button.on("mouseout", (function () {
    this.button.texture = this.btnPasifTexture;
  }).bind(this));
  this.button.on("click", (function () {
    this.cevir();
  }).bind(this));
  this.stage.addChild(this.button);

  // pop-over for description text
  this.createPopOvers();
};

Cark.prototype.analyseText = function () {

  var _maxTextLen = 0;

  for (var i = 0; i < this.slices.length; i++) {
    var sliceLen = this.slices[i].text.length;
    if (sliceLen > _maxTextLen) {
      _maxTextLen = sliceLen;
    }
  }

  this.maxTextLen = _maxTextLen;
  this.radsPerLetter = this.radPerSlice / (_maxTextLen + 2);
};

Cark.prototype.createPopOvers = function () {

  var fontSize = Math.ceil(0.13 * this.radius);
  var textWidth = this.rect.width * 0.6;
  var bgWidth = this.rect.width * 0.65;
  var bgHeight = bgWidth / 2;

  var style = {
    font: 'bold italic ' + fontSize + 'px Arial',
    align: 'center',
    fill: '#F7EDCA',
    stroke: '#4a1850',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: textWidth
  };

  this.popOvers = [];

  for (var i = 0; i < this.slices.length; i++) {

    //var popBg = new PIXI.Graphics();
    //popBg.lineStyle(2, 0x000000, 1);
    //popBg.beginFill(0x000000, 0.50);
    //popBg.drawRoundedRect(-bgWidth/2, -bgHeight/2, bgWidth, bgHeight, 10);
    //popBg.endFill();
    //popBg.pivot.set(0.5, 0.5);
    //popBg.position.set(this.centerPoint.x, this.centerPoint.y);
    //popBg.visible = false;

    var popTxt = new PIXI.Text(this.slices[i].description, style);
    popTxt.anchor.set(0.5, 0.5);
    popTxt.position.set(this.centerPoint.x, this.centerPoint.y);
    popTxt.visible = false;

    //popBg.addChild(popTxt);

    this.stage.addChild(popTxt);
    this.popOvers.push(popTxt);
  }
};

Cark.prototype.createSliceText = function (i, container) {

  var radEmptySpace = (this.radPerSlice - this.radsPerLetter * this.slices[i].text.length) / 2;

  var rotStart = i * this.radPerSlice - this.radPerSlice / 2 + radEmptySpace + this.radsPerLetter / 2;

  var text = this.slices[i].text;

  var style = {
    font: '20px Courier',
    fill: '#fff'
  };

  for (var j = 0; j < text.length; j++) {
    var rot = rotStart + j * this.radsPerLetter;
    var txt = new PIXI.Text(text[j], style);
    txt.x = this.centerPoint.x + 0.95 * this.radius * Math.cos(rot);
    txt.y = this.centerPoint.y + 0.95 * this.radius * Math.sin(rot);
    txt.anchor.set(0.5, 0.5);
    txt.rotation = rot + Math.PI / 2;
    container.addChild(txt);
  }
};

Cark.prototype.placeSliceIcon = function (i, container) {
  var rot = i * this.radPerSlice;

  var iconTexture = PIXI.Texture.fromImage('images/' + this.slices[i].icon);
  var icon = new PIXI.Sprite(iconTexture);
  icon.anchor.set(0.5, 0.5);

  icon.scale.set(this.iconScale, this.iconScale);
  icon.rotation = rot + Math.PI / 2;

  icon.position.x = this.centerPoint.x + this.radius * 0.7 * Math.cos(rot);
  icon.position.y = this.centerPoint.y + this.radius * 0.7 * Math.sin(rot);

  icon.interactive = true;
  icon.tint = 0xededed;

  icon.on('mouseover', (function () {
    if (this.isTurning) return;
    this.popOvers[i].visible = true;
    icon.tint = 0xffffff;
  }).bind(this));

  icon.on('mouseout', (function () {
    this.popOvers[i].visible = false;
    icon.tint = 0xededed;
  }).bind(this));

  container.addChild(icon);
};

Cark.prototype.turnCark = function (p2, p1, t2, t1) {
  var dx = p2.x - p1.x;
  var dy = p2.y - p1.y;
  var dt = t2 - t1;

  this.mouseVelocity = { x: dx / dt, y: dy / dt };

  var magVel = Math.sqrt(this.mouseVelocity.x * this.mouseVelocity.x + this.mouseVelocity.y * this.mouseVelocity.y);

  console.log("magvel", magVel);

  if (magVel < 0.4) return;

  var xProj = this.p.x > 0 ? -this.mouseVelocity.y : this.mouseVelocity.y;
  var yProj = this.p.y > 0 ? this.mouseVelocity.x : -this.mouseVelocity.x;

  console.log(xProj, yProj);

  this.isTurning = true;
  this.omega = (xProj + yProj) * (Math.PI / 120 / 2);

  this.onDragFinished({ omega: this.omega * 180 / Math.PI });
  this.audio.play();

  this.isDown = false;

  // aktif dilim resetle
  this.slices.map(function (s) {
    s.graphics.tint = 0xffffff;
  });
};

function roundZero(val, delta) {
  return Math.abs(val) < delta ? 0 : val;
}

Cark.prototype.update = function () {

  var dt = Date.now() - this.lastUpdate;

  // update phsyics
  this.theta += this.omega * dt;

  this.theta = roundZero(this.theta, 0.001);
  this.omega = roundZero(this.omega * (1 - this.friction), this.dumping);

  if (this.isTurning && this.omega === 0) {
    this.audio.playWin();
    this.won = true;
    this.audio.stop();
    this.isTurning = false;
    this.turningDirection = 0;

    var _theta = (this.theta + Math.PI / 2 + this.radPerSlice / 2) % (2 * Math.PI);
    var winIndex = (this.slices.length - Math.floor(this.slices.length * _theta / (2 * Math.PI))) % this.slices.length;

    this.slices[winIndex].graphics.tint = this.slices[winIndex].bgColor;

    if (this.onWin) this.onWin(this.slices[winIndex]);
    if (this.turnOnce !== true) this.won = false;
  } else if (this.isTurning) {
    this.audio.setRate(1 - this.friction);
  }

  this.stageCark.rotation = this.theta;

  this.updateDil();

  this.lastUpdate = Date.now();

  this.renderer.render(this.stage);

  requestAnimationFrame(this.update.bind(this));
};

Cark.prototype.updateDil = function () {
  var rot = Math.abs(Math.sin(this.theta * 8)) * Math.PI / 4;
  this.dil.rotation = -1 * this.turningDirection * rot;
};

Cark.prototype.toLocalCoords = function (x, y) {
  // coordiantes relative to the top-left of canvas
  var x1 = x - this.rect.left;
  var y1 = y - this.rect.top;

  // relative to the center of the wheel
  x1 = x1 - this.rect.width / 2;
  y1 = this.rect.height / 2 - y1;

  return { x: x1, y: y1 };
};

Cark.prototype.cevir = function () {
  if (this.won && this.turnOnce === true) return;
  if (this.isTurning) return;

  this.slices.map(function (s) {
    s.graphics.tint = 0xffffff;
  });

  this.isTurning = true;

  var turnVel = 1.2 + 1.5 * Math.random();
  this.turningDirection = 1;
  this.omega = turnVel * (Math.PI / 120 / 2);
  this.audio.play();

  console.log(this.omega);

  this.isDown = false;
};

var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
  window.setTimeout(callback, 1000 / 60);
};

exports["default"] = Cark;
module.exports = exports["default"];


},{"./Audio":"/Users/evox/Google Drive/yortuc/side projects/carkifelek/src/js/Audio.js","./resources":"/Users/evox/Google Drive/yortuc/side projects/carkifelek/src/js/resources.js"}],"/Users/evox/Google Drive/yortuc/side projects/carkifelek/src/js/resources.js":[function(require,module,exports){
// load resources (images)
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = {

    images: {},

    loadImages: function loadImages(sources, callback) {

        var loadedImages = 0;
        var numImages = 0;

        for (var src in sources) {
            numImages++;
        }

        for (var src in sources) {
            var key = sources[src].image;
            this.images[key] = new Image();
            this.images[key].onload = (function () {
                if (++loadedImages >= numImages) {
                    callback(this.images);
                }
            }).bind(this);

            var imagePath = sources[src].image;

            this.images[key].src = "images/" + imagePath;
        }
    },

    loadImagesFromArray: function loadImagesFromArray(sourcesArr, callback) {

        var loadedImages = 0;
        var numImages = sourcesArr.length;

        for (var i = 0; i < sourcesArr.length; i++) {
            var source = sourcesArr[i];

            this.images[source] = new Image();
            this.images[source].onload = (function () {
                if (++loadedImages >= numImages) {
                    callback(this.images);
                }
            }).bind(this);

            this.images[source].src = "images/" + source;
        }
    }
};
module.exports = exports["default"];


},{}],"/Users/evox/Google Drive/yortuc/side projects/carkifelek/src/main.js":[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _jsCark_pixi = require('./js/Cark_pixi');

var _jsCark_pixi2 = _interopRequireDefault(_jsCark_pixi);

var _jsResources = require('./js/resources');

var _jsResources2 = _interopRequireDefault(_jsResources);

var cark = new _jsCark_pixi2['default']({
	canvasId: "canvas_cark1",
	turnOnce: false,

	slices: [{ text: "MARMARIS", bgColor: 0x43768b, icon: 'otel1.png', description: "Güzel Otel 7/24 Konaklama Herşey Dahil Sizi Bekliyor" }, { text: "FETHİYE", bgColor: 0x797b7b, icon: 'otel2.png', description: "FETHİYE Oteli Açıklama" }, { text: "KEMER", bgColor: 0x33669a, icon: 'otel3.png', description: "KEMER Oteli Açıklama" }, { text: "ALANYA", bgColor: 0xc6a860, icon: 'otel4.png', description: "ALANYA Oteli Açıklama" }, { text: "BELEK", bgColor: 0xde5b61, icon: 'otel1.png', description: "BELEK Oteli Açıklama" }, { text: "KEMER", bgColor: 0x335c40, icon: 'otel2.png', description: "KEMER Oteli Açıklama" }, { text: "KUŞADASI", bgColor: 0xc95309, icon: 'otel3.png', description: "KUŞADASI Oteli Açıklama" }, { text: "SİDE", bgColor: 0xfba608, icon: 'otel4.png', description: "SİDE Oteli Açıklama" }, { text: "ALANYA", bgColor: 0xaca1cd, icon: 'otel1.png', description: "ALANYA Oteli Açıklama" }, { text: "BODRUM", bgColor: 0x43768b, icon: 'otel2.png', description: "BODRUM Oteli Açıklama" }, { text: "KEMER", bgColor: 0xc6a860, icon: 'otel3.png', description: "KEMER Oteli Açıklama" }, { text: "ÇEŞME", bgColor: 0xde5b61, icon: 'otel4.png', description: "ÇEŞME Oteli Açıklama" }],

	onDragFinished: function onDragFinished(e) {
		console.log("onDragFinished", e);
	},

	onWin: function onWin(e) {
		console.log("onWin", e);
	}
});
cark.update();

var cark2 = new _jsCark_pixi2['default']({
	canvasId: "canvas_cark2",
	turnOnce: true,
	iconScale: 0.2,

	slices: [{ text: "MARMARIS", bgColor: 0x43768b, icon: 'otel1.png', description: "Güzel Otel 7/24 Konaklama Herşey Dahil Sizi Bekliyor" }, { text: "FETHİYE", bgColor: 0x797b7b, icon: 'otel2.png', description: "FETHİYE Oteli Açıklama" }, { text: "KEMER", bgColor: 0x33669a, icon: 'otel3.png', description: "KEMER Oteli Açıklama" }, { text: "ALANYA", bgColor: 0xc6a860, icon: 'otel4.png', description: "ALANYA Oteli Açıklama" }, { text: "BELEK", bgColor: 0xde5b61, icon: 'otel1.png', description: "BELEK Oteli Açıklama" }, { text: "KEMER", bgColor: 0x335c40, icon: 'otel2.png', description: "KEMER Oteli Açıklama" }],

	onDragFinished: function onDragFinished(e) {
		console.log("onDragFinished", e);
	},

	onWin: function onWin(e) {
		console.log("onWin", e);
	}
});

cark2.update();


},{"./js/Cark_pixi":"/Users/evox/Google Drive/yortuc/side projects/carkifelek/src/js/Cark_pixi.js","./js/resources":"/Users/evox/Google Drive/yortuc/side projects/carkifelek/src/js/resources.js"}]},{},["/Users/evox/Google Drive/yortuc/side projects/carkifelek/src/main.js"])


//# sourceMappingURL=bundle.js.map
