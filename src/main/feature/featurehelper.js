import { FeatureNone } from './featurenone';
import { FeatureStatic } from './featurestatic';
import { FeatureWaveExtended } from './featurewaveextended';
import { FeatureSpectrum } from './featurespectrum';
import { FeatureReactive } from './featurereactive';
import { FeatureBreathe } from './featurebreathe';
import { FeatureStarlight } from './featurestarlight';
import { FeatureRipple } from './featureripple';
import { FeatureWheel } from './featurewheel';
import { FeatureBrightness } from './featurebrightness';
import { FeatureWaveSimple } from './featurewavesimple';
import { FeatureOldMouseEffects } from './featureoldmouseeffects';
import { FeatureMouseBrightness } from './featuremousebrightness';
import { FeatureMousePollRate } from './featuremousepollrate';
import { FeatureMouseDPI } from './featuremousedpi';
import { RazerDeviceType } from '../device/razerdevicetype';
import { FeatureIdentifier } from './featureidentifier';
import { FeatureBattery } from './featurebattery';

export class FeatureHelper {

  static createFeatureFrom(featureIdentifier) {
    switch (featureIdentifier) {
      case FeatureIdentifier.NONE: return new FeatureNone();
      case FeatureIdentifier.STATIC: return new FeatureStatic();
      case FeatureIdentifier.WAVE_SIMPLE: return new FeatureWaveSimple();
      case FeatureIdentifier.WAVE_EXTENDED: return new FeatureWaveExtended();
      case FeatureIdentifier.SPECTRUM: return new FeatureSpectrum();
      case FeatureIdentifier.REACTIVE: return new FeatureReactive();
      case FeatureIdentifier.BREATHE: return new FeatureBreathe();
      case FeatureIdentifier.STARLIGHT: return new FeatureStarlight();
      case FeatureIdentifier.BRIGHTNESS: return new FeatureBrightness();
      case FeatureIdentifier.RIPPLE: return new FeatureRipple();
      case FeatureIdentifier.WHEEL: return new FeatureWheel();
      case FeatureIdentifier.OLD_MOUSE_EFFECTS: return new FeatureOldMouseEffects();
      case FeatureIdentifier.MOUSE_BRIGHTNESS: return new FeatureMouseBrightness();
      case FeatureIdentifier.POLL_RATE: return new FeatureMousePollRate();
      case FeatureIdentifier.MOUSE_DPI: return new FeatureMouseDPI();
      case FeatureIdentifier.BATTERY: return new FeatureBattery();
      default:
        throw featureIdentifier+' is not a valid feature identifier!'
    }
  }

  static getDefaultFeaturesFor(mainType) {
    switch (mainType) {
      case RazerDeviceType.KEYBOARD:
        return [
          new FeatureNone(),
          new FeatureStatic(),
          new FeatureWaveExtended(),
          new FeatureSpectrum(),
          new FeatureReactive(),
          new FeatureBreathe(),
          new FeatureStarlight(),
          new FeatureRipple(),
          new FeatureWheel(),
          new FeatureBrightness(),
        ];
      case RazerDeviceType.MOUSE:
        return [
          new FeatureNone(),
          new FeatureStatic(),
          new FeatureWaveSimple(),
          new FeatureSpectrum(),
          new FeatureReactive(),
          new FeatureBreathe(),
          new FeatureOldMouseEffects(),
          new FeatureMouseBrightness(),
          new FeatureMousePollRate(),
          new FeatureMouseDPI(),
          new FeatureBattery(),
        ];
      case RazerDeviceType.MOUSEDOCK:
        return [
          new FeatureNone(),
          new FeatureStatic(),
          new FeatureSpectrum(),
          new FeatureBreathe(),
          new FeatureBattery(),
        ];
      case RazerDeviceType.MOUSEMAT:
        return [
          new FeatureNone(),
          new FeatureStatic(),
          new FeatureWaveSimple(),
          new FeatureSpectrum(),
          new FeatureBreathe(),
          new FeatureBrightness()
        ];
      case RazerDeviceType.EGPU:
        return [
          new FeatureNone(),
          new FeatureStatic(),
          new FeatureWaveSimple(),
          new FeatureSpectrum(),
          new FeatureBreathe(),
        ];
      case RazerDeviceType.HEADPHONE:
        return [
          new FeatureNone(),
          new FeatureStatic(),
          new FeatureSpectrum(),
          new FeatureBreathe(),
        ];
      case RazerDeviceType.ACCESSORY:
        return [
          new FeatureNone(),
          new FeatureStatic(),
          new FeatureWaveExtended(),
          new FeatureSpectrum(),
          new FeatureBreathe(),
        ];
      default:
        console.warn("Unknown mainType "+mainType+". Can't detect feature set.");
        return [];
    }
  }
}