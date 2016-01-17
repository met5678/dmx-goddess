var device = require('./device');

var LEDs = 120;
var channels = [];
for(var a=0; a<LEDs.length; a++) {
  var base = a*3;
  channels[base] = 0xFF;
  channels[base+1] = 0x00;
  channels[base+2] = 0x99;
}

device.setValues(channels);