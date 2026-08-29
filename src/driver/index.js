// The .node binary cannot be bundled, and native modules cannot be loaded from
// inside an asar archive. ?asset emits it and returns a real path; &asarUnpack
// tells electron-builder to keep it outside the archive.
import addonPath from '../../build/Release/addon.node?asset&asarUnpack';

export default require(addonPath);
