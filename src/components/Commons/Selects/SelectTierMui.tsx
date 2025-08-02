import React from 'react';
import { PokemonClass, PokemonType } from '../../../enums/type.enum';
import { getKeyWithData, isSpecialMegaFormType } from '../../../utils/utils';
import { ISelectTierComponent } from '../models/component.model';
import SelectMui from './SelectMui';
import { Box } from '@mui/material';
import { combineClasses } from '../../../utils/extension';

const SelectTierMui = (props: ISelectTierComponent) => {
  return (
    <Box className={combineClasses('d-flex justify-content-center', props.boxClassName)}>
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
        menuItems={[
          { label: 'Normal Tiers', isSubHeader: true },
          { label: 'Tier 1', value: 1 },
          { label: 'Tier 3', value: 3 },
          ...(!isSpecialMegaFormType(props.pokemonType) || props.pokemonClass === PokemonClass.None
            ? [{ label: 'Tier 5', value: 5 }]
            : []),
          { label: 'Legacy Tiers', isSubHeader: true },
          { label: 'Tier 2', value: 2 },
          ...(!isSpecialMegaFormType(props.pokemonType) || props.pokemonClass !== PokemonClass.None
            ? [{ label: 'Tier 4', value: 4 }]
            : []),
          ...(isSpecialMegaFormType(props.pokemonType) && props.pokemonClass !== PokemonClass.None
            ? [
                {
                  label: `Legendary ${
                    props.pokemonType === PokemonType.Primal
                      ? getKeyWithData(PokemonType, PokemonType.Primal)
                      : getKeyWithData(PokemonType, PokemonType.Mega)
                  } Tier 6`,
                  isSubHeader: true,
                },
              ]
            : []),
          ...(isSpecialMegaFormType(props.pokemonType) && props.pokemonClass !== PokemonClass.None
            ? [
                {
                  label: `Tier ${
                    props.pokemonType === PokemonType.Primal
                      ? getKeyWithData(PokemonType, PokemonType.Primal)
                      : getKeyWithData(PokemonType, PokemonType.Mega)
                  }`,
                  value: 6,
                },
              ]
            : []),
          ...(isSpecialMegaFormType(props.pokemonType) && props.pokemonClass === PokemonClass.None
            ? [{ label: 'Mega Tier 4', isSubHeader: true }]
            : []),
          ...(isSpecialMegaFormType(props.pokemonType) && props.pokemonClass === PokemonClass.None
            ? [{ label: 'Tier Mega', value: 4 }]
            : []),
        ]}
      />
    </Box>
  );
};

export default SelectTierMui;
