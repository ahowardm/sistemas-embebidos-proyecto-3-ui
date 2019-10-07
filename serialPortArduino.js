const SerialPort = require('serialport');
const constants = require('./constants');

module.exports = {
    getArduinoPort: async function(){
        let arduinoPort;
        await SerialPort.list(function(err, ports) {
            let allports = ports.length;
            let count = 0;
            let done = false
            ports.forEach(function(port) {
                count += 1;
                pm = port['manufacturer'];
                if (typeof pm !== 'undefined' && pm.includes('arduino')) {
                    arduinoPort = port.comName.toString();
                    done = true
                }
            });
            if (count === allports) {
                if (!done){
                    arduinoPort = constants.NOT_CONNECTED_ARDUINO;
                }
                //callback(arduinoPort);
            }
        });
        return arduinoPort;
    },
}

