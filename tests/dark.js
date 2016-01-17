var serialPort = require('serialport');
var onExit = require('signal-exit');

var START_VAL        = 0x7e;
var MSG_TYPE_DMX_OUT = 0x06;
var DMX_STARTCODE    = 0x00;
var END_VAL          = 0xE7;

var fps = 15;

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
  for(var led=0; led < LEDs; led ++) {
    var channel = led*3+5;
    sendBuffer[channel] = 0;
    sendBuffer[channel+1] = 0;
    sendBuffer[channel+2] = 1;
  }
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
