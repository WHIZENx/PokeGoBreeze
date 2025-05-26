import React, { useCallback, useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { predictCPList } from '../../util/calculate';
import { IPredictCPCalculate } from '../../util/models/calculate.model';
import { IDynamicInputCPComponent } from '../models/component.model';
import { getValueOrDefault, isNullOrUndefined } from '../../util/extension';
import { isInvalidIV } from '../../util/utils';

const DynamicInputCP = (props: IDynamicInputCPComponent) => {
  const [preCpArr, setPreCpArr] = useState<IPredictCPCalculate>();

  const findStatsCP = useCallback(() => {
    if (isInvalidIV(props.ivAtk) || isInvalidIV(props.ivDef) || isInvalidIV(props.ivSta)) {
      return;
    }
    if (
      !isNullOrUndefined(props.statATK) &&
      !isNullOrUndefined(props.statDEF) &&
      !isNullOrUndefined(props.statSTA) &&
      props.statATK > 0 &&
      props.statDEF > 0 &&
      props.statSTA > 0
    ) {
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
        } else if (newValue) {
          props.setSearchCP(getValueOrDefault(String, newValue.CP.toString()));
        } else {
          props.setSearchCP('');
        }
      }}
      options={getValueOrDefault(Array, preCpArr?.result)}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }
        return `Level: ${option.level} | CP: ${option.CP}`;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      renderOption={(props, option) => (
        <li {...props} key={props.key}>{`Level: ${option.level} | CP: ${option.CP}`}</li>
      )}
      sx={{
        width: !isNullOrUndefined(props.width) ? props.width : 'auto',
        minWidth: !isNullOrUndefined(props.minWidth) ? props.minWidth : 'auto',
      }}
      freeSolo
      renderInput={(params) => <TextField {...params} label={props.label} />}
    />
  );
};

export default DynamicInputCP;
