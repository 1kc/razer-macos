const fs = require('fs');

export function getAllRazerDeviceConfigurations(folder) {
 return fs.readdirSync(folder).map(filename => {
    if(filename.endsWith('.json')) {
        const razerDevice = JSON.parse(fs.readFileSync(folder + "/" + filename, 'utf-8'));
        return {
            name: razerDevice.name,
            productId: parseInt(razerDevice.productId,16),
            mainType: razerDevice.mainType
        };
    }
    return null;
 }).filter(razerDevice => {
     return razerDevice != null;
 });
}