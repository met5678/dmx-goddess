var device = require('./device');
var Canvas = require('canvas');
var w = 18;
var h = 9;

var mapping = 
  [ 0 , 98, 0 , 0 , 0 , 0 , 0 ,116, 0 , 0 ,107, 0 , 0 , 0 , 0 , 0 , 89, 0 ,
    68, 97, 0 , 0 , 0 , 0 , 0 ,115, 61, 54,106, 0 , 0 , 0 , 0 , 0 , 88, 47,
    67, 96, 0 , 0 , 0 , 0 , 0 ,114, 60, 53,105, 0 , 0 , 0 , 0 , 0 , 87, 46,
    66, 95, 19, 0 , 0 , 0 , 32,113, 59, 52,104, 24, 0 , 0 , 0 , 37, 86, 45,
    65, 94, 18, 72, 9 , 76, 31,112, 58, 51,103, 23, 4 , 14, 80, 36, 85, 44,
    64, 93, 17, 71, 8 , 75, 30,111, 57, 50,102, 22, 3 , 13, 79, 35, 84, 43,
    63, 92, 16, 70, 7 , 74, 29,110, 56, 49,101, 21, 2 , 12, 78, 34, 83, 42,
    62, 91, 15, 69, 6 , 73, 28,109, 55, 48,100, 20, 1 , 11, 77, 33, 82, 41,
    0 , 90, 0 , 0 , 5 , 0 , 0 ,108, 0 , 0 , 99, 0 , 0 , 10, 0 , 0 , 81, 0 ];




var questions = require('questions');

var curChannel = 0;
var channels = [];

var canvas = new Canvas(w,h);
var ctx = canvas.getContext('2d');

var curRing = 0;

var progress = 0;

var doFrame = function() {
  progress += 0.01;
  if(progress >= 1) {
    progress = 0;
  }
  doRainbow();
  render();
}

var drawLine = function() {
  var curRing = progress * w;
  ctx.clearRect(0,0,w,h);

  ctx.strokeStyle = 'rgba(255,120,0,.25)';
  ctx.beginPath();
  //ctx.moveTo(0,curRing-.5);
  //ctx.lineTo(w,curRing-.5);
  ctx.moveTo(curRing-.5,0);
  ctx.lineTo(curRing-.5,h);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,120,0,1)';
  ctx.beginPath();
  //ctx.moveTo(0,curRing);
  //ctx.lineTo(w,curRing);
  ctx.moveTo(curRing,0);
  ctx.lineTo(curRing,h);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,120,0,.25)';
  ctx.beginPath();
  //ctx.moveTo(0,curRing+.5);
  //ctx.lineTo(w,curRing+.5);
  ctx.moveTo(curRing+.5,0);
  ctx.lineTo(curRing+.5,h);
  ctx.stroke();
}

var doRainbow = function() {
  var gradient = ctx.createLinearGradient(0, -h + h*progress, 0, h + h*progress);
  gradient.addColorStop(0, 'red');  
  gradient.addColorStop(1 / 14, 'orange');  
  gradient.addColorStop(2 / 14, 'yellow');  
  gradient.addColorStop(3 / 14, 'green');  
  gradient.addColorStop(4 / 14, 'blue');  
  gradient.addColorStop(5 / 14, 'indigo');  
  gradient.addColorStop(6 / 14, 'violet');  
  gradient.addColorStop(7 / 14, 'red');  
  gradient.addColorStop(8 / 14, 'orange');  
  gradient.addColorStop(9 / 14, 'yellow');  
  gradient.addColorStop(10 / 14, 'green');  
  gradient.addColorStop(11 / 14, 'blue');  
  gradient.addColorStop(12 / 14, 'indigo');  
  gradient.addColorStop(13 / 14, 'violet');  
  gradient.addColorStop(1, 'red');  
  ctx.fillStyle = gradient;  
  ctx.fillRect(0, 0, w, h);
  //ctx.fillStyle = '#000000';
  //ctx.fillRect(0, 0, w, h-1);
}

var render = function() {
  getChannels();
  device.setValues(channels);
}

var getChannels = function() {
  var imageData = ctx.getImageData(0,0,w,h).data;
  for(var row = 0; row<h; row++) {
    for(var col = 0; col<w; col++) {
      var address = mapping[row*w + col];
      if(address > 0) {
        var realAddr = (address-1)*3;
        var pixelAddr = (row*w + col)*4;
        var mult = imageData[pixelAddr+3]/255;
        channels[realAddr] = (mult*imageData[pixelAddr])|0;
        channels[realAddr+1] = (mult*imageData[pixelAddr+1])|0;
        channels[realAddr+2] = (mult*imageData[pixelAddr+2])|0;
      }
    }
  }
}

setInterval(doFrame, 25);