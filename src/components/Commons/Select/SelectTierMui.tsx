import React from 'react';
import { toNumber } from '../../../utils/extension';
import { PokemonClass, PokemonType } from '../../../enums/type.enum';
import { getKeyWithData, isSpecialMegaFormType } from '../../../utils/utils';
import { ISelectTierComponent } from '../../models/component.model';
import { ListSubheader, MenuItem, Select } from '@mui/material';

const SelectTierMui = (props: ISelectTierComponent) => {
  return (
    <Select
      size="small"
      className={props.className}
      onChange={(e) => {
        const tier = toNumber(e.target.value);
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
    >
      <ListSubheader>Normal Tiers</ListSubheader>
      <MenuItem value={1}>Tier 1</MenuItem>
      <MenuItem value={3}>Tier 3</MenuItem>
      {(!isSpecialMegaFormType(props.pokemonType) || props.pokemonClass === PokemonClass.None) && (
        <MenuItem value={5}>Tier 5</MenuItem>
      )}
      <ListSubheader>Legacy Tiers</ListSubheader>
      <MenuItem value={2}>Tier 2</MenuItem>
      {(!isSpecialMegaFormType(props.pokemonType) || props.pokemonClass !== PokemonClass.None) && (
        <MenuItem value={4}>Tier 4</MenuItem>
      )}
      {isSpecialMegaFormType(props.pokemonType) && props.pokemonClass !== PokemonClass.None && (
        <ListSubheader>{`Legendary ${
          props.pokemonType === PokemonType.Primal
            ? getKeyWithData(PokemonType, PokemonType.Primal)
            : getKeyWithData(PokemonType, PokemonType.Mega)
        } Tier 6`}</ListSubheader>
      )}
      {isSpecialMegaFormType(props.pokemonType) && props.pokemonClass !== PokemonClass.None && (
        <MenuItem value={6}>
          {`Tier ${
            props.pokemonType === PokemonType.Primal
              ? getKeyWithData(PokemonType, PokemonType.Primal)
              : getKeyWithData(PokemonType, PokemonType.Mega)
          }`}
        </MenuItem>
      )}
      {isSpecialMegaFormType(props.pokemonType) && props.pokemonClass === PokemonClass.None && (
        <ListSubheader>Mega Tier 4</ListSubheader>
      )}
      {isSpecialMegaFormType(props.pokemonType) && props.pokemonClass === PokemonClass.None && (
        <MenuItem value={4}>Tier Mega</MenuItem>
      )}
    </Select>
  );
};

export default SelectTierMui;
