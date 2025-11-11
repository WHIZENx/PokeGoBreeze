import { Tooltip, tooltipClasses } from '@mui/material';
import React from 'react';
import { ITooltip } from '../models/component.model';
import { styled } from '@mui/material/styles';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CustomTooltip = styled(({ className, hideBackground, customStyles, colorArrow, ...props }: ITooltip) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ hideBackground, customStyles, colorArrow }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: colorArrow,
  },
  [`& .${tooltipClasses.tooltip}`]: hideBackground
    ? { padding: 0, backgroundColor: 'transparent', ...customStyles }
    : { ...customStyles },
}));

const Tooltips = (props: ITooltip) => {
  return (
    <CustomTooltip id={props.id} {...props}>
      {props.children}
    </CustomTooltip>
  );
};

export default Tooltips;
