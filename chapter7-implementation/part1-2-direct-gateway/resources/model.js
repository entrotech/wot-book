const resources = require("./resources.json");
const actuators = resources.pi.actuators;
const sensors = resources.pi.sensors;

const registrations = new Map();

resources.registerSubscriber = (resource, onChangeHandler) => {
  registrations.get(resource).add(onChangeHandler);
};

resources.unregisterSubscriber = (resource, onChangeHandler) => {
  registrations.get(resource).delete(onChangeHandler);
};

// Actuator resources are observable for hardware drivers to detect
actuators.leds["1"] = createProxy(actuators.leds["1"]);
actuators.leds["2"] = createProxy(actuators.leds["2"]);

// Sensor resources are observable for WebSockets to detect and
// push notifications to client
sensors.temperature = createProxy(sensors.temperature);
sensors.humidity = createProxy(sensors.humidity);
sensors.pir = createProxy(sensors.pir);

// Replaces resource object with a Proxy that allows
// us to make the value propery observable
function createProxy(target) {
  proxy = new Proxy(target, {
    set: function (obj, prop, value, proxy) {
      obj[prop] = value;
      if (prop === "value") {
        for (let handler of registrations.get(proxy)) {
          handler(proxy, prop, value);
        }
      }
      return true;
    }
  });
  // Use Set to keep track of listeners, allowing unsubscribe fn
  registrations.set(proxy, new Set());
  return proxy;
}

module.exports = resources;
