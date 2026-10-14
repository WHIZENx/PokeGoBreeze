import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { IPredictCPCalculate } from '../../../utils/models/calculate.model';
import { IDynamicInputCPComponent } from '../models/component.model';
import { getValueOrDefault, isNullOrUndefined } from '../../../utils/extension';
import { isInvalidIV } from '../../../utils/utils';
import APIService from '../../../services/api.service';
import { maxPokemonLevel } from '../../../utils/helpers/options-context.helpers';

const optionLabel = (level: number, cp: number) =>
  `Level: ${level}${level > maxPokemonLevel() ? ' (Best Buddy)' : ''} | CP: ${cp}`;

const DynamicInputCP = (props: IDynamicInputCPComponent) => {
  const [preCpArr, setPreCpArr] = useState<IPredictCPCalculate>();

  useEffect(() => {
    if (isInvalidIV(props.ivAtk) || isInvalidIV(props.ivDef) || isInvalidIV(props.ivSta)) {
      setPreCpArr(undefined);
      return undefined;
    }
    if (
      !isNullOrUndefined(props.statATK) &&
      !isNullOrUndefined(props.statDEF) &&
      !isNullOrUndefined(props.statSTA) &&
      props.statATK > 0 &&
      props.statDEF > 0 &&
      props.statSTA > 0
    ) {
      const url = APIService.getFindCalculation({
        mode: 'cp',
        atk: props.statATK,
        def: props.statDEF,
        sta: props.statSTA,
        atkIv: props.ivAtk,
        defIv: props.ivDef,
        staIv: props.ivSta,
        minLevel: props.minLevel,
        maxLevel: props.maxLevel,
        step: props.levelStep,
        minIv: props.minIv,
        maxIv: props.maxIv,
        minCp: props.minCp,
      });
      let active = true;
      APIService.getFetchUrl<{ data: IPredictCPCalculate }>(url)
        .then(({ data }) => {
          if (active) {
            setPreCpArr(data.data);
          }
        })
        .catch(() => {
          if (active) {
            setPreCpArr(undefined);
          }
        });
      return () => {
        active = false;
      };
    }
    setPreCpArr(undefined);
    return undefined;
  }, [
    props.statATK,
    props.statDEF,
    props.statSTA,
    props.ivAtk,
    props.ivDef,
    props.ivSta,
    props.minLevel,
    props.maxLevel,
    props.levelStep,
    props.minIv,
    props.maxIv,
    props.minCp,
  ]);

  return (
    <Autocomplete
      value={props.searchCP}
      inputValue={props.searchCP}
      onInputChange={(_, newInputValue, reason) => {
        if (reason === 'input' || reason === 'clear') {
          props.setSearchCP(newInputValue);
          props.setSearchLevel?.(undefined);
        }
      }}
      onChange={(_, newValue) => {
        if (typeof newValue === 'string') {
          props.setSearchCP(newValue);
          props.setSearchLevel?.(undefined);
        } else if (newValue) {
          props.setSearchCP(getValueOrDefault(String, newValue.CP.toString()));
          props.setSearchLevel?.(newValue.level);
        } else {
          props.setSearchCP('');
          props.setSearchLevel?.(undefined);
        }
      }}
      options={getValueOrDefault(Array, preCpArr?.result)}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }
        return optionLabel(option.level, option.CP);
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      renderOption={(props, option) => (
        <li {...props} key={props.key}>
          {optionLabel(option.level, option.CP)}
        </li>
      )}
      sx={{
        width: !isNullOrUndefined(props.width) ? props.width : 'auto',
        minWidth: !isNullOrUndefined(props.minWidth) ? props.minWidth : 'auto',
      }}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.label}
          inputProps={{ ...params.inputProps, pattern: '[0-9]*', inputMode: 'numeric' }}
        />
      )}
    />
  );
};

export default DynamicInputCP;
