import { Box, FormControlLabel } from '@mui/material';
import React from 'react';
import { FormControlMuiComponent } from '../models/component.model';
import { combineClasses } from '../../../utils/extension';

const FormControlMui = (props: FormControlMuiComponent) => {
  const { labelPrepend, ...controlProps } = props;

  return (
    <Box
      className={combineClasses(
        'input-control-group',
        props.width === 'fit-content' ? 'w-fit-content' : '',
        props.boxClassName
      )}
    >
      {labelPrepend && <span className="input-group-text">{labelPrepend}</span>}
      <FormControlLabel
        {...controlProps}
        className={combineClasses('mx-0 pe-1', props.className)}
        sx={{
          '& .MuiTypography-root': {
            width: props.width || '100%',
          },
          ...props.sx,
        }}
      />
      {props.children}
    </Box>
  );
};

export default FormControlMui;
