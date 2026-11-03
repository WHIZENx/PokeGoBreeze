import React from 'react';
import Chip from '@mui/material/Chip';
import { IEffectiveComponent } from '../models/component.model';

const Effective = (props: IEffectiveComponent) => {
  if (!props.children) {
    return null;
  }
  return (
    <div className="tw-mt-4 tw-min-w-0">
      <h5 className="!tw-m-0 tw-mb-1.5 tw-pb-1">
        <Chip component="span" label={props.title} size="small" variant="outlined" />
      </h5>
      <div className="tw-min-w-0">{props.children}</div>
    </div>
  );
};

export default Effective;
