var addon = require('bindings')('addon.node')

console.log('This should be eight:', addon.add(3, 5))
console.log(addon.readDeviceType())
