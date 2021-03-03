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

export class FeatureHelper {

  static createFeatureFrom(featureConfig) {
    const featureIdentifier = Object.keys(featureConfig)[0];
    const configuration = featureConfig[featureIdentifier];
    switch (featureIdentifier) {
      case 'none': return new FeatureNone(configuration);
      case 'static': return new FeatureStatic(configuration);
      case 'waveSimple': return new FeatureWaveSimple(configuration);
      case 'waveExtended': return new FeatureWaveExtended(configuration);
      case 'spectrum': return new FeatureSpectrum(configuration);
      case 'reactive': return new FeatureReactive(configuration);
      case 'breathe': return new FeatureBreathe(configuration);
      case 'starlight': return new FeatureStarlight(configuration);
      case 'brightness': return new FeatureBrightness(configuration);
      case 'ripple': return new FeatureRipple(configuration);
      case 'oldMouseEffects': return new FeatureOldMouseEffects(configuration);
      default:
        throw featureIdentifier+' is not a valid feature identifier!'
    }
  }
}