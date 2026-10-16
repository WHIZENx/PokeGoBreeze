import React, { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { ITab, TabPanelComponent } from '../models/component.model';
import { combineClasses } from '../../../utils/extension';

const CustomTabPanel = (props: ITab) => {
  const { children, value, tabValue } = props;

  return (
    <div role="tabpanel" hidden={value !== tabValue} id={`tabpanel-${tabValue}`} aria-labelledby={`tab-${tabValue}`}>
      {value === tabValue && <Box>{children}</Box>}
    </div>
  );
};

const a11yProps = (value: number) => {
  return {
    id: `tab-${value}`,
    'aria-controls': `tabpanel-${value}`,
  };
};

const TabsPanel = (props: TabPanelComponent) => {
  const [internalValue, setInternalValue] = useState(props.defaultValue ?? 0);
  const value = props.value ?? internalValue;

  const handleChange = (_: React.SyntheticEvent, tabValue: number) => {
    if (props.value === undefined) {
      setInternalValue(tabValue);
    }
    props.onChange?.(tabValue);
  };

  return (
    <Box className={combineClasses('tw-w-full', props.className)}>
      <Box
        className="tw-border-0 tw-border-b tw-border-solid"
        sx={{ borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        <Tabs variant="fullWidth" value={value} onChange={handleChange}>
          {props.tabs.map((tab, index) => (
            <Tab key={index} className="!tw-normal-case" label={tab.label} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      {props.tabs.map((tab, index) => (
        <CustomTabPanel key={index} value={value} tabValue={index}>
          {value === index && tab.renderChildren ? tab.renderChildren() : tab.children}
        </CustomTabPanel>
      ))}
    </Box>
  );
};

export default TabsPanel;
