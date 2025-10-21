import { Box, FormControlLabel } from '@mui/material';
import React from 'react';
import { FormControlMuiComponent } from '../models/component.model';
import { combineClasses } from '../../../utils/extension';

const FormControlMui = (props: FormControlMuiComponent) => {
  const { labelPrepend, isNotGroup, boxClassName, className, label, children, control, ...controlProps } = props;

  return (
    <Box
      className={combineClasses(
        isNotGroup ? '' : 'input-control-group',
        props.width === 'fit-content' ? '!tw-w-fit' : '',
        boxClassName
      )}
    >
      {labelPrepend && <span className="input-group-text">{labelPrepend}</span>}
      {control && (
        <FormControlLabel
          {...controlProps}
          className={combineClasses(className, '!tw-mx-0 tw-pr-3')}
          sx={{
            '& .MuiTypography-root': {
              width: props.width,
            },
            ...props.sx,
          }}
          label={label}
          control={control}
        />
      )}
      {children}
    </Box>
  );
};

export default FormControlMui;
