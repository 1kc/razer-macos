import React from 'react';

export class SectionProductHeader extends React.Component {
  constructor(props) {
    super(props);
    this.deviceSelected = props.deviceSelected;
  }
  render() {
    return <div id='product'>
      {this.deviceSelected.image != null && (
        <div>
          <div className='product-image-background' style={{ backgroundImage: 'url('+this.deviceSelected.image+')' }}></div>
          <div className='product-image'><img src={this.deviceSelected.image} /></div>
        </div>
      )}
      <div className='product-description'>{this.deviceSelected.name}</div>
    </div>
  }
}