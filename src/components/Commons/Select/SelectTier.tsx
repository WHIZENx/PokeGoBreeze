import React, { Fragment } from 'react';
import { Form } from 'react-bootstrap';
import { toNumber } from '../../../utils/extension';
import { PokemonClass, PokemonType } from '../../../enums/type.enum';
import { getKeyWithData, isSpecialMegaFormType } from '../../../utils/utils';
import { ISelectTierComponent } from '../models/component.model';

const SelectTier = (props: ISelectTierComponent) => {
  return (
    <Form.Select
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
      <optgroup label="Normal Tiers">
        <option value={1}>Tier 1</option>
        <option value={3}>Tier 3</option>
        {(props.pokemonType !== PokemonType.Mega || props.pokemonClass === PokemonClass.None) && (
          <option value={5}>Tier 5</option>
        )}
      </optgroup>
      <optgroup label="Legacy Tiers">
        <option value={2}>Tier 2</option>
        {(props.pokemonType !== PokemonType.Mega || props.pokemonClass !== PokemonClass.None) && (
          <option value={4}>Tier 4</option>
        )}
      </optgroup>
      {isSpecialMegaFormType(props.pokemonType) && (
        <Fragment>
          {props.pokemonClass !== PokemonClass.None ? (
            <optgroup
              label={`Legendary ${
                props.pokemonType === PokemonType.Primal
                  ? getKeyWithData(PokemonType, PokemonType.Primal)
                  : getKeyWithData(PokemonType, PokemonType.Mega)
              } Tier 6`}
            >
              <option value={6}>
                {`Tier ${
                  props.pokemonType === PokemonType.Primal
                    ? getKeyWithData(PokemonType, PokemonType.Primal)
                    : getKeyWithData(PokemonType, PokemonType.Mega)
                }`}
              </option>
            </optgroup>
          ) : (
            <optgroup label="Mega Tier 4">
              <option value={4}>Tier Mega</option>
            </optgroup>
          )}
        </Fragment>
      )}
    </Form.Select>
  );
};

export default SelectTier;
