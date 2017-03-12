(function() {

  var self = {};

  self.streaming = false;
  self.video = document.querySelector('#pht_video');
  self.canvas = document.querySelector('#pht_canvas');
  self.width = 480;
  self.height = 0;

  navigator.getMedia = ( navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia);

  self.init = function(){
    $('#dlgTakePhoto').on('hidden.bs.modal', function (e) {
      // dialog close callback
      self.stopCamera();
    });
  }

  self.startCamera = function(){
    navigator.getMedia(
      {
        video: true,
        audio: false
      },
      function(stream) {
        if (navigator.mozGetUserMedia) {
          self.video.mozSrcObject = stream;
        } else {
          var vendorURL = window.URL || window.webkitURL;
          self.video.src = vendorURL.createObjectURL(stream);
        }
        self.video.play();
      },
      function(err) {
        console.log("An error occured! " + err);
      }
    );

    self.video.addEventListener('canplay', function(ev){
      if (!self.streaming) {
        self.height = self.video.videoHeight / (self.video.videoWidth/self.width);
        self.video.setAttribute('width', self.width);
        self.video.setAttribute('height', self.height);
        self.canvas.setAttribute('width', self.width);
        self.canvas.setAttribute('height', self.height);
        self.streaming = true;
      }
    }, false);
  }

  self.stopCamera = function(){
    self.video.pause();
    self.streaming = false;
  }

  self.takePhoto = function() {
    self.canvas.width = self.width;
    self.canvas.height = self.height;
    self.canvas.getContext('2d').drawImage(self.video, 0, 0, self.width, self.height);
    var data = self.canvas.toDataURL('image/png');
    
    fabric.Image.fromURL(data, function(img) {
      img.set('left', 300).set('top', 300);
      capsli.addObject(img);
    });

    // return data; // return data url
  }

  capsli.webCam = {
    streaming: self.streaming,
    startCamera: self.startCamera,
    stopCamera: self.stopCamera,
    takePhoto: self.takePhoto
  };

  self.init();

})();