var serialPort = require('serialport');
var onExit = require('signal-exit');
var _ = require('lodash');

var START_VAL        = 0x7e;
var MSG_TYPE_DMX_OUT = 0x06;
var DMX_STARTCODE    = 0x00;
var END_VAL          = 0xE7;

var defaults = {
  channels: 512,
  fps: 40
};

var portOpen = function(err) {
  if(err) {
    console.log('Error on OPEN', err);
  }
  else {
    console.log('OPEN');
    open = true;
    console.log(device);
    //setInterval(dmxLoop, 1000/fps);
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

var EnttecDMXUSBPro = function(options) {
  var device;
  var settings = _.assign({}, defaults, options);

  var port = findPort(device);

  var initPort = function(port, device) {
    device = new serialPort.SerialPort(port.comName, {
      baudrate: 57600,
      stopBits: 2
    });
    device.on('open',  portOpen.bind(this));
    device.on('error', portError.bind(this));
    device.on('close', portClose.bind(this));
  };

  onExit(function() {
    if(open) {
      console.log('AUTO CLOSING');
      dmxPro.close();
    }
  });

  

};

var findPort = function() {
  var devicePort = 'null';
  serialPort.list(function (err, ports) {
    ports.forEach(function(port) {
      console.log(port);
      if(port.manufacturer == 'DMXking.com') {
        devicePort = port;
      }
    });
  });
  return devicePort;
};

var prepareBuffers = function() {
  var startBuffer = new Buffer([
    START_VAL,
    MSG_TYPE_DMX_OUT,
    (numChannels+1) & 0xFF,
    ((numChannels+1) >> 8),
    DMX_STARTCODE
  ]);
  var endBuffer = new Buffer([END_VAL]);
}

var dmxLoop = function() {
  prepareBuffers();
  dmxPro.write(sendBuffer, onSend);
};

var onSend = function(error) {
};

findAndConnect();

module.exports = {

};