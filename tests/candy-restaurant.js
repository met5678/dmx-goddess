var Color = require("color");
var Easing = require("easing");
var serialPort = require('serialport');
var onExit = require('signal-exit');

var START_VAL        = 0x7e;
var MSG_TYPE_DMX_OUT = 0x06;
var DMX_STARTCODE    = 0x00;
var END_VAL          = 0xE7;

var fps = 40;

var open = false;
var LEDs = 120;
var spacing = 10;//var numChannels = 360;
var channels = [];
var dmxPro;

var portOpen = function(err) {
  if(err) {
    console.log('Error on OPEN', err);
  }
  else {
    console.log('OPEN');
    open = true;
    setInterval(dmxLoop, 1000/fps);
  }
};

var portError = function(err) {
  if(err) {
    console.log('Error on ERROR', err);
  }
  else {
    console.log('Error');
  }
};

var portClose = function(err) {
  open = false;
  if(err) {
    console.log('Error on CLOSE', err);
  }
  else {
    console.log('CLOSE');
  }
};

var initPort = function(port) {
  dmxPro = new serialPort.SerialPort(port.comName, {
    baudrate: 57600,
    stopBits: 2
  });
  dmxPro.on('open',  portOpen);
  dmxPro.on('error', portError);
  dmxPro.on('close', portClose);
};

onExit(function() {
  if(open) {
    console.log('AUTO CLOSING');
    dmxPro.close();
  }
});

var findAndConnect = function() {
  serialPort.list(function (err, ports) {
    ports.forEach(function(port) {
      console.log(port);
      if(port.manufacturer == 'DMXking.com') {
        initPort(port);
      }
    });
  });
};

var sendBuffer;
var frame = 0;

var prepareBuffers = function() {
  var numChannels = LEDs*3;
  sendBuffer = new Buffer(numChannels+6);
  sendBuffer.fill(0);
  sendBuffer[0] = START_VAL;
  sendBuffer[1] = MSG_TYPE_DMX_OUT;
  sendBuffer[2] = (numChannels+1) & 0xFF;
  sendBuffer[3] = (numChannels+1) >> 8;
  sendBuffer[4] = DMX_STARTCODE;
  var buf = ledFrames[curFrame];
  for(var a=0; a<LEDs*3; a++) {
    sendBuffer[a+5] = buf[a];
  }


  if(curFrame < composite-1)
    curFrame++;
  else
    curFrame = 0;  

  sendBuffer[numChannels+5] = END_VAL;
  frame++;
  if(frame >= spacing) {
    frame = 0;
  }
  //console.log(sendBuffer.length, frame);
}

var dmxLoop = function() {
  prepareBuffers();
  dmxPro.write(sendBuffer, onSend);
};

var onSend = function(error) {
};

findAndConnect();

var numLEDs = 120;
var channels = numLEDs*3;

var buf = new Buffer(channels);
buf.fill(0x00);

// Using [composite] as our frame number so that we can loop as many frames as is possible
var composite = 840;
var factors = [2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 15, 20, 21, 24, 28];
var invFactors = [420, 280, 210, 168, 140, 120, 105, 84, 70, 60, 56, 42, 40, 35, 30];

var hue = 60;
var sat = 100;
var value = 100;
var spread = 170;
var easeType = 'circular';

var twoPi = Math.PI*2;

// Max 14
var slowestEasingIndex = 13;
var fastestEasingIndex = 14;
var ledFrames = [];

var onFraction = .2;

var easingLib = [];
for(var easingLibIndex=0, framesIndex = slowestEasingIndex; framesIndex <= fastestEasingIndex;easingLibIndex++,framesIndex++) {
  var numFrames = invFactors[framesIndex];
  var numOnFrames = Math.round(numFrames * onFraction);
  var startingFrame = Math.floor((numFrames-numOnFrames)/2);
  var onEasingFrames = Easing(numOnFrames,easeType,{endToEnd:true});
  var easingFrames = [];
  console.log(numFrames,numOnFrames,startingFrame,onEasingFrames.length);
  for(var easingFrameIndex=0; easingFrameIndex<numFrames; easingFrameIndex++) {
    if(easingFrameIndex < startingFrame)
      easingFrames[easingFrameIndex] = 0;
    else if(easingFrameIndex < numOnFrames + startingFrame)
      easingFrames[easingFrameIndex] = onEasingFrames[easingFrameIndex-startingFrame];
    else
      easingFrames[easingFrameIndex] = 0;
  }
  easingLib[easingLibIndex] = easingFrames;
}

var getSpreadColor = function() {
  var thisSpread = Math.random()*spread;
  var hueValue = hue-(spread/2)+thisSpread;
  if(hueValue < 0)
    hueValue += 360;
  else if(hueValue >= 360)
    hueValue -= 360;
  return Color({
    h:hueValue,
    s:sat,
    v:value
  })
}

for(var led=0; led<numLEDs; led++) {
  var colorRGB = getSpreadColor().values.rgb;
  var cycleFrames = easingLib[Math.floor(Math.random()*easingLib.length)];
  var cycleFramesNum = cycleFrames.length;
  var offsetNum = Math.floor(Math.random()*cycleFramesNum);

  for(var frame=0; frame<composite; frame++) {
    if(led == 0)
      ledFrames[frame] = new Buffer(channels);

    var buffer = ledFrames[frame];
    var rIndex = led*3;
    var cycleFrame = cycleFrames[(offsetNum+frame)%cycleFramesNum];

    buffer[rIndex] = Math.round(cycleFrame*colorRGB[0]);
    buffer[rIndex+1] = Math.round(cycleFrame*colorRGB[1]);
    buffer[rIndex+2] = Math.round(cycleFrame*colorRGB[2]);
  }
}

var curFrame = 0;

function init() {

}

function noop() {}

function loop() {
  var buf = ledFrames[curFrame];

  if(curFrame < composite-1)
    curFrame++;
  else
    curFrame = 0;

  spi.write(buf,noop);
  //setImmediate(loop);
}

//loop();
// Minimum delay for these lights is 5
//setInterval(loop,15);
