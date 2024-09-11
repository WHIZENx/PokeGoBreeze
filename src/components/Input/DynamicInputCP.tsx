import React, { useCallback, useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { predictCPList } from '../../util/calculate';
import { MIN_IV, MAX_IV } from '../../util/constants';
import { IPredictCPCalculate } from '../../util/models/calculate.model';
import { IDynamicInputCPComponent } from '../models/component.model';
import { getValueOrDefault } from '../../util/extension';

const DynamicInputCP = (props: IDynamicInputCPComponent) => {
  const [preCpArr, setPreCpArr] = useState<IPredictCPCalculate>();

  const findStatsCP = useCallback(() => {
    if (
      props.ivAtk < MIN_IV ||
      props.ivAtk > MAX_IV ||
      props.ivDef < MIN_IV ||
      props.ivDef > MAX_IV ||
      props.ivSta < MIN_IV ||
      props.ivSta > MAX_IV
    ) {
      return;
    }
    if (props.statATK && props.statDEF && props.statSTA) {
      const result = predictCPList(props.statATK, props.statDEF, props.statSTA, props.ivAtk, props.ivDef, props.ivSta);
      setPreCpArr(result);
    }
  }, [props.statATK, props.statDEF, props.statSTA, props.ivAtk, props.ivDef, props.ivSta]);

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
          props.setSearchCP(getValueOrDefault(String, newValue?.CP.toString()));
        }
      }}
      options={getValueOrDefault(Array, preCpArr?.result)}
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

export default DynamicInputCP;
