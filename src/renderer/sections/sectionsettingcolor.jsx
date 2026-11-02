import React from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import CustomColor from '../components/CustomColor';
import CustomColor2 from '../components/CustomColor2';
import { SectionSettingBlock } from './sectionsettingblock.jsx';
import { FeatureIdentifier } from '../../main/feature/featureidentifier';

export class SectionSettingColor extends SectionSettingBlock {
  constructor(props) {
    super(props);
    this.staticFeature = this.deviceSelected.features.find(feature => feature.featureIdentifier === FeatureIdentifier.STATIC);
  }

  renderTitle() {
    return this.deviceSelected.settings.customColor2 != null ? 'Colors' : 'Color';
  }

  renderSettings() {
    if (!this.staticFeature) {
      return null;
    }

    if (this.deviceSelected.settings.customColor2 != null) {
      return <Tabs>
        <TabList>
          <Tab>Primary custom color</Tab>
          <Tab>Secondary custom color</Tab>
        </TabList>
        <TabPanel>
          <CustomColor deviceSelected={this.deviceSelected} />
        </TabPanel>
        <TabPanel>
          <CustomColor2 deviceSelected={this.deviceSelected} />
        </TabPanel>
      </Tabs>;
    }
    return <div style={{ paddingTop: '10px' }}>
      <CustomColor deviceSelected={this.deviceSelected} />
    </div>;

  }
}