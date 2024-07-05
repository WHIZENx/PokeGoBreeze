import React, { useCallback, useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { predictCPList } from '../../util/Calculate';
import { MIN_IV, MAX_IV } from '../../util/Constants';
import { IPredictCPCalculate } from '../../util/models/calculate.model';

const FreeSoloInput = (props: {
  statATK: number;
  statDEF: number;
  statSTA: number;
  IV_ATK: number;
  IV_DEF: number;
  IV_STA: number;
  searchCP: string;
  setSearchCP: React.Dispatch<React.SetStateAction<string>>;
  label?: string;
  width?: number | string;
  minWidth?: number | string;
}) => {
  const [preCpArr, setPreCpArr]: [IPredictCPCalculate | undefined, React.Dispatch<React.SetStateAction<IPredictCPCalculate | undefined>>] =
    useState();

  const findStatsCP = useCallback(() => {
    if (
      props.IV_ATK < MIN_IV ||
      props.IV_ATK > MAX_IV ||
      props.IV_DEF < MIN_IV ||
      props.IV_DEF > MAX_IV ||
      props.IV_STA < MIN_IV ||
      props.IV_STA > MAX_IV
    ) {
      return;
    }
    if (props.statATK && props.statDEF && props.statSTA) {
      const result = predictCPList(props.statATK, props.statDEF, props.statSTA, props.IV_ATK, props.IV_DEF, props.IV_STA);
      setPreCpArr(result);
    }
  }, [props.statATK, props.statDEF, props.statSTA, props.IV_ATK, props.IV_DEF, props.IV_STA]);

  useEffect(() => {
    findStatsCP();
  }, [findStatsCP]);

  return (
    <Autocomplete
      value={props.searchCP}
      onChange={(_, newValue) => {
        if (typeof newValue === 'string') {
          props.setSearchCP(newValue);
        } else {
          props.setSearchCP(newValue?.CP.toString() ?? '');
        }
      }}
      options={preCpArr?.result ?? []}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }
        return `Level: ${option.level} | CP: ${option.CP}`;
      }}
      selectOnFocus={true}
      clearOnBlur={true}
      handleHomeEndKeys={true}
      renderOption={(props, option) => <li {...props}>{`Level: ${option.level} | CP: ${option.CP}`}</li>}
      sx={{ width: props.width ?? 'auto', minWidth: props.minWidth ?? 'auto' }}
      freeSolo={true}
      renderInput={(params) => <TextField {...params} label={props.label} />}
    />
  );
};

export default FreeSoloInput;
