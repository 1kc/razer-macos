import { FeatureNone } from './featurenone';
import { FeatureStatic } from './featurestatic';
import { FeatureWaveExtended } from './featurewaveextended';
import { FeatureSpectrum } from './featurespectrum';
import { FeatureReactive } from './featurereactive';
import { FeatureBreathe } from './featurebreathe';
import { FeatureStarlight } from './featurestarlight';
import { FeatureRipple } from './featureripple';
import { FeatureBrightness } from './featurebrightness';
import { FeatureWaveSimple } from './featurewavesimple';
import { FeatureOldMouseEffects } from './featureoldmouseeffects';
import { FeatureMouseBrightness } from './featuremousebrightness';
import { FeatureMousePollRate } from './featuremousepollrate';
import { FeatureMouseDPI } from './featuremousedpi';

export class FeatureHelper {

  static createFeatureFrom(featureConfig) {
    const featureIdentifier = Object.keys(featureConfig)[0];
    const configuration = featureConfig[featureIdentifier];
    switch (featureIdentifier) {
      case FeatureHelper.FEATURE_NONE: return new FeatureNone(configuration);
      case FeatureHelper.FEATURE_STATIC: return new FeatureStatic(configuration);
      case FeatureHelper.FEATURE_WAVE_SIMPLE: return new FeatureWaveSimple(configuration);
      case FeatureHelper.FEATURE_WAVE_EXTENDED: return new FeatureWaveExtended(configuration);
      case FeatureHelper.FEATURE_SPECTRUM: return new FeatureSpectrum(configuration);
      case FeatureHelper.FEATURE_REACTIVE: return new FeatureReactive(configuration);
      case FeatureHelper.FEATURE_BREATHE: return new FeatureBreathe(configuration);
      case FeatureHelper.FEATURE_STARLIGHT: return new FeatureStarlight(configuration);
      case FeatureHelper.FEATURE_BRIGHTNESS: return new FeatureBrightness(configuration);
      case FeatureHelper.FEATURE_RIPPLE: return new FeatureRipple(configuration);
      case FeatureHelper.FEATURE_OLD_MOUSE_EFFECTS: return new FeatureOldMouseEffects(configuration);
      case FeatureHelper.FEATURE_MOUSE_BRIGHTNESS: return new FeatureMouseBrightness(configuration);
      case FeatureHelper.FEATURE_POLL_RATE: return new FeatureMousePollRate(configuration);
      case FeatureHelper.FEATURE_MOUSE_DPI: return new FeatureMouseDPI(configuration);
      default:
        throw featureIdentifier+' is not a valid feature identifier!'
    }
  }
}

FeatureHelper.FEATURE_NONE = 'none';
FeatureHelper.FEATURE_STATIC = 'static';
FeatureHelper.FEATURE_WAVE_SIMPLE = 'waveSimple';
FeatureHelper.FEATURE_WAVE_EXTENDED = 'waveExtended';
FeatureHelper.FEATURE_SPECTRUM = 'spectrum';
FeatureHelper.FEATURE_REACTIVE = 'reactive';
FeatureHelper.FEATURE_BREATHE = 'breathe';
FeatureHelper.FEATURE_STARLIGHT = 'starlight';
FeatureHelper.FEATURE_BRIGHTNESS = 'brightness';
FeatureHelper.FEATURE_RIPPLE = 'ripple';
FeatureHelper.FEATURE_OLD_MOUSE_EFFECTS = 'oldMouseEffects';
FeatureHelper.FEATURE_MOUSE_BRIGHTNESS = 'mouseBrightness';
FeatureHelper.FEATURE_POLL_RATE = 'pollRate';
FeatureHelper.FEATURE_MOUSE_DPI = 'dpi';