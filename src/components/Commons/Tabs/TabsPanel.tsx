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
  const [value, setValue] = useState(props.defaultValue || 0);

  const handleChange = (_: React.SyntheticEvent, tabValue: number) => {
    setValue(tabValue);
  };

  return (
    <Box className={combineClasses('w-100', props.className)}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs variant="fullWidth" value={value} onChange={handleChange}>
          {props.tabs.map((tab, index) => (
            <Tab key={index} sx={{ textTransform: 'none' }} label={tab.label} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      {props.tabs.map((tab, index) => (
        <CustomTabPanel key={index} value={value} tabValue={index}>
          {tab.children}
        </CustomTabPanel>
      ))}
    </Box>
  );
};

export default TabsPanel;
