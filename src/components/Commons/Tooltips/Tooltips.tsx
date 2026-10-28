import { ClickAwayListener, Tooltip, tooltipClasses } from '@mui/material';
import React, { useState } from 'react';
import { ITooltip } from '../models/component.model';
import { styled } from '@mui/material/styles';

const CustomTooltip = styled(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, hideBackground, customStyles, colorArrow, openOnClick, ...props }: ITooltip) => (
    <Tooltip {...props} classes={{ popper: className }} />
  )
)(({ hideBackground, customStyles, colorArrow }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: colorArrow,
  },
  [`& .${tooltipClasses.tooltip}`]: hideBackground
    ? { padding: 0, backgroundColor: 'transparent', ...customStyles }
    : { ...customStyles },
}));

const Tooltips = (props: ITooltip) => {
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [isTransientOpen, setIsTransientOpen] = useState(false);
  const openOnClick = props.openOnClick ?? true;

  if (openOnClick) {
    const { children, onClose, onOpen, open, openOnClick: _openOnClick, ...tooltipProps } = props;
    const isOpen = open ?? (isPinnedOpen || isTransientOpen);
    void _openOnClick;
    const close = (event: MouseEvent | TouchEvent | React.SyntheticEvent) => {
      setIsPinnedOpen(false);
      setIsTransientOpen(false);
      onClose?.(event);
    };
    return (
      <ClickAwayListener onClickAway={close}>
        <span
          className="tw-inline-flex"
          onClick={() => {
            setIsTransientOpen(false);
            setIsPinnedOpen((value) => !value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              close(event);
            }
          }}
        >
          <CustomTooltip
            {...tooltipProps}
            disableTouchListener
            open={isOpen}
            onOpen={(event) => {
              setIsTransientOpen(true);
              onOpen?.(event);
            }}
            onClose={(event) => {
              setIsTransientOpen(false);
              onClose?.(event);
            }}
          >
            {children}
          </CustomTooltip>
        </span>
      </ClickAwayListener>
    );
  }

  return (
    <CustomTooltip id={props.id} {...props}>
      {props.children}
    </CustomTooltip>
  );
};

export default Tooltips;
