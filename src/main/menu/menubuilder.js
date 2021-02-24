import {getKeyboardMenuFor} from "./menukeyboard";
import {getMouseMenuFor} from "./menumouse";
import {getMouseDockMenuFor} from "./menumousedock";
import {getMouseMatMenuFor} from "./menumousemat";
import {getEGPUMenuFor} from "./menuegpu";
import {getHeadphoneMenuFor} from "./menuheadphone";
import {getAccessoryMenuFor} from "./menuaccessory";

export function createMenuFor(razerDevice) {
    if(!razerDevice.features) {
        // build menu based on device type
        switch (razerDevice.mainType) {
            case "keyboard":
                return getKeyboardMenuFor(razerDevice);
            case "mouse":
                return getMouseMenuFor(razerDevice);
            case "mousedock":
                return getMouseDockMenuFor(razerDevice);
            case "mousemat":
                return getMouseMatMenuFor(razerDevice);
            case "egpu":
                return getEGPUMenuFor(razerDevice);
            case "headphone":
                return getHeadphoneMenuFor(razerDevice);
            case "accessory":
                return getAccessoryMenuFor(razerDevice);
            default:
                return [];
        }
    } else {
        //TODO: implement based on capabilities
        return [];
    }
}