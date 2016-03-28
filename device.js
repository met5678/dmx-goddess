var serialPort = require('serialport');
var onExit = require('signal-exit');

var START_VAL        = 0x7E;
var MSG_TYPE_DMX_OUT = 0x06;
var DMX_STARTCODE    = 0x00;
var END_VAL          = 0xE7;

var fps = 40;
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
var channels = 500;

var prepareBuffer = function() {
  sendBuffer = new Buffer(channels+6);
  sendBuffer.fill(0x00);
  sendBuffer[0] = START_VAL;
  sendBuffer[1] = MSG_TYPE_DMX_OUT;
  sendBuffer[2] = (channels+1) & 0xFF;
  sendBuffer[3] = (channels+1) >> 8;
  sendBuffer[4] = DMX_STARTCODE;
  sendBuffer[5 + channels] = END_VAL;
}

var setValues = function(values) {
  for(var i=0; i<values.length; i++) {
    sendBuffer[i+5] = values[i];
  }
}

var dmxLoop = function() {
  dmxPro.write(sendBuffer, onSend);
};

var onSend = function(error) {
  if(error) {
    console.log('Error on SEND',error);
  }
};

prepareBuffer();
findAndConnect();

module.exports = {
  setValues: setValues
};
