import React from 'react';
import { PokemonClass, PokemonType } from '../../../enums/type.enum';
import { ISelectTierComponent } from '../models/component.model';
import SelectMui from './SelectMui';
import { Box } from '@mui/material';
import { combineClasses } from '../../../utils/extension';
import useDataStore from '../../../composables/useDataStore';

const SelectTierMui = (props: ISelectTierComponent) => {
  const { optionsData } = useDataStore();
  const enhancedRaidLevels = new Set(optionsData?.raid.entryCosts.map((entry) => entry.raidLevel) ?? []);
  const isPrimal = props.pokemonType === PokemonType.Primal;
  const isMega = props.pokemonType === PokemonType.Mega;
  const isLegendaryMega = isMega && Number(props.pokemonClass) > PokemonClass.None;
  const menuItems = isPrimal
    ? [
        { label: 'Primal Raid', isSubHeader: true },
        { label: 'Primal Raid (Tier 6)', value: 6 },
      ]
    : isMega
      ? [
          { label: 'Mega Raids', isSubHeader: true },
          {
            label: isLegendaryMega ? 'Mega Legendary Raid (Tier 6)' : 'Mega Raid (Tier 4)',
            value: isLegendaryMega ? 6 : 4,
          },
          ...(enhancedRaidLevels.has(isLegendaryMega ? 'RAID_LEVEL_5_MEGA_ENHANCED' : 'RAID_LEVEL_4_MEGA_ENHANCED')
            ? [
                { label: 'Super Mega Raid', isSubHeader: true },
                {
                  label: 'Super Mega Raid (Shields unsupported)',
                  value: isLegendaryMega ? 5 : 4,
                  disabled: true,
                },
              ]
            : []),
        ]
      : [
          { label: 'Current Tiers', isSubHeader: true },
          { label: 'Tier 1', value: 1 },
          { label: 'Tier 3', value: 3 },
          {
            label: props.pokemonClass === PokemonClass.UltraBeast ? 'Ultra Beast Raid (Tier 5)' : 'Tier 5',
            value: 5,
          },
          { label: 'Legacy Tiers', isSubHeader: true },
          { label: 'Tier 2', value: 2 },
          { label: 'Tier 4', value: 4 },
        ];

  return (
    <Box className={combineClasses('tw-flex tw-justify-center', props.boxClassName)}>
      <SelectMui
        className={props.className}
        isNoneBorder
        onChangeSelect={(tier) => {
          if (props.setCurrTier) {
            props.setCurrTier(tier);
          }
          if (props.setTier) {
            props.setTier(tier);
          }
          if (props.clearData) {
            props.clearData();
          }
        }}
        value={props.tier}
        menuItems={menuItems}
      />
    </Box>
  );
};

export default SelectTierMui;
