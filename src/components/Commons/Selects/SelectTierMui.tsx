import React from 'react';
import { ISelectTierComponent } from '../models/component.model';
import SelectMui from './SelectMui';
import { Box } from '@mui/material';
import { combineClasses } from '../../../utils/extension';
import useDataStore from '../../../composables/useDataStore';
import { normalizeRaidSelection, raidTierMenuItems } from '../../../utils/raid-tier';

const SelectTierMui = (props: ISelectTierComponent) => {
  const { optionsData } = useDataStore();
  const enhancedRaidLevels = new Set(optionsData?.raid.entryCosts.map((entry) => entry.raidLevel) ?? []);
  const menuItems = raidTierMenuItems(props.pokemonType, props.pokemonClass, enhancedRaidLevels);
  const selectMenuItems = menuItems.map(({ label, value, disabled, isSubHeader }) => ({
    label,
    value,
    disabled,
    isSubHeader,
  }));
  const selected = normalizeRaidSelection(
    props.tier,
    props.raidLevel,
    props.pokemonType,
    props.pokemonClass,
    enhancedRaidLevels
  );

  return (
    <Box className={combineClasses('tw-flex tw-justify-center', props.boxClassName)}>
      <SelectMui
        className={props.className}
        isNoneBorder
        onChangeSelect={(raidLevel) => {
          const selection = menuItems.find((item) => item.value === raidLevel);
          if (!selection?.tier) {
            return;
          }
          if (props.setCurrTier) {
            props.setCurrTier(selection.tier);
          }
          if (props.setTier) {
            props.setTier(selection.tier);
          }
          if (props.setRaidLevel) {
            props.setRaidLevel(raidLevel);
          }
          if (props.clearData) {
            props.clearData();
          }
        }}
        value={selected?.value ?? ''}
        menuItems={selectMenuItems}
      />
    </Box>
  );
};

export default SelectTierMui;
