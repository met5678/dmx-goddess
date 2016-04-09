const device = require('./device');
const ipc    = require('ipc-goddess');
const nconf  = require('nconf');
nconf.argv().env();

const FPS  = 40;

const config = {
  id: 'dmx-goddess'
};

const channelsInput = nconf.get('IN_CHANNELS');
console.log(channelsInput);
if(channelsInput) {
  config.inputs = {
    'channels': channelsInput
  };
}

ipc.initSocket(config);

ipc.on('channels', function(data) {
  device.setChannels(data);
});
