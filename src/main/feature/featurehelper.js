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

export class FeatureHelper {

  static createFeatureFrom(featureConfig) {
    const featureIdentifier = Object.keys(featureConfig)[0];
    const configuration = featureConfig[featureIdentifier];
    switch (featureIdentifier) {
      case FeatureIdentifier.NONE: return new FeatureNone(configuration);
      case FeatureIdentifier.STATIC: return new FeatureStatic(configuration);
      case FeatureIdentifier.WAVE_SIMPLE: return new FeatureWaveSimple(configuration);
      case FeatureIdentifier.WAVE_EXTENDED: return new FeatureWaveExtended(configuration);
      case FeatureIdentifier.SPECTRUM: return new FeatureSpectrum(configuration);
      case FeatureIdentifier.REACTIVE: return new FeatureReactive(configuration);
      case FeatureIdentifier.BREATHE: return new FeatureBreathe(configuration);
      case FeatureIdentifier.STARLIGHT: return new FeatureStarlight(configuration);
      case FeatureIdentifier.BRIGHTNESS: return new FeatureBrightness(configuration);
      case FeatureIdentifier.RIPPLE: return new FeatureRipple(configuration);
      case FeatureIdentifier.WHEEL: return new FeatureWheel(configuration);
      case FeatureIdentifier.OLD_MOUSE_EFFECTS: return new FeatureOldMouseEffects(configuration);
      case FeatureIdentifier.MOUSE_BRIGHTNESS: return new FeatureMouseBrightness(configuration);
      case FeatureIdentifier.POLL_RATE: return new FeatureMousePollRate(configuration);
      case FeatureIdentifier.MOUSE_DPI: return new FeatureMouseDPI(configuration);
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
        ];
      case RazerDeviceType.MOUSEDOCK:
        return [
          new FeatureNone(),
          new FeatureStatic(),
          new FeatureSpectrum(),
          new FeatureBreathe(),
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