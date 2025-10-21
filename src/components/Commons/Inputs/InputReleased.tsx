import React from 'react';
import FormControlMui from '../Forms/FormControlMui';
import { Checkbox, Switch } from '@mui/material';
import { combineClasses } from '../../../utils/extension';
import APIService from '../../../services/api.service';
import { SwitchReleasedComponent } from '../models/component.model';
import useIcon from '../../../composables/useIcon';

const InputReleased = (props: SwitchReleasedComponent) => {
  const { iconData } = useIcon();

  return (
    <FormControlMui
      width={props.width || 'fit-content'}
      control={
        <>
          {props.inputMode === 'checkbox' ? (
            <Checkbox
              disabled={props.isDisabled}
              checked={props.releasedGO}
              onChange={(_, check) => props.setReleaseGO(check)}
            />
          ) : (
            <Switch
              disabled={props.isDisabled}
              checked={props.releasedGO}
              onChange={(_, check) => props.setReleaseGO(check)}
            />
          )}
        </>
      }
      label={
        <span className="tw-flex tw-items-center tw-gap-2">
          <span>Released in GO</span>
          <img
            className={combineClasses(props.isAvailable ? '' : 'filter-gray')}
            width={28}
            height={28}
            alt="Pokémon GO Icon"
            src={APIService.getPokemonGoIcon(iconData)}
          />
          {props.label}
        </span>
      }
      disabled={props.isBlock}
    />
  );
};

export default InputReleased;
