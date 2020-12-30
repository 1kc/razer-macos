import React from 'react';
import * as pkg from '../../../../package.json';

const FooterInfo = () => {
  return (<React.Fragment>Razer macOS v{pkg.version}</React.Fragment>);
}
export default FooterInfo;
