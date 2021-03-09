import React from 'react';

export class SectionSettingBlock extends React.Component {
  constructor(props) {
    super(props);
    this.deviceSelected = props.deviceSelected;
  }

  //needs to be overridden by child
  renderTitle() {
    return '';
  }
  renderSettings() {
    return JSX.Element;
  }

  render() {
    const renderedSettings = this.renderSettings();
    if(renderedSettings == null) {
      return null;
    }

    return <div className='settings-block'>
      <div className='settings-block-title'>{this.renderTitle()}</div>
      <div className='settings-block-body'>{renderedSettings}</div>
    </div>
  }
}