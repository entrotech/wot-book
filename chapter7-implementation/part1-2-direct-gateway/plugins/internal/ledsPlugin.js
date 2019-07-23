var resources = require('./../../resources/model');

var actuator, interval, handler;
var model = resources.pi.actuators.leds['1'];
var pluginName = model.name;
var localParams = { 'simulate': false, 'frequency': 2000 };

exports.start = function (params) {
  localParams = params;
  resources.registerSubscriber(model, handler); //#A

  if (localParams.simulate) {
    simulate();
  } else {
    connectHardware();
  }
};

exports.stop = function () {
  resources.unregisterSubscriber(model, handler);
  if (localParams.simulate) {
    clearInterval(interval);
  } else {
    actuator.unexport();
  }
  console.info('%s plugin stopped!', pluginName);
};

function handler(resource, prop, value) {
  console.info("LED Plugin: %s: %s = %s", resource.name, prop, value);
  switchOnOff(value); //#B
}

function switchOnOff(value) {
  if (!localParams.simulate) {
    actuator.write(value === true ? 1 : 0, function () { //#C
      console.info('Changed value of %s to %s', pluginName, value);
    });
  }
};

function connectHardware() {
  var Gpio = require('onoff').Gpio;
  actuator = new Gpio(model.gpio, 'out'); //#D
  console.info('Hardware %s actuator started!', pluginName);
};

function simulate() {
  interval = setInterval(function () {
    // Switch value on a regular basis
    if (model.value) {
      model.value = false;
    } else {
      model.value = true;
    }
    console.log(`Simulated value is now ${model.value}`)
  }, localParams.frequency);
  console.info('Simulated %s actuator started!', pluginName);
};

//#A Observe the model for the LEDs
//#B Listen for model changes, on changes call switchOnOff
//#C Change the LED state by changing the GPIO state
//#D Connect the GPIO in write (output) mode

