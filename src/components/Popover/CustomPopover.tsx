import React, { forwardRef, useEffect } from 'react';
import { Popover, PopoverProps } from 'react-bootstrap';

const CustomPopover = forwardRef<HTMLDivElement, PopoverProps>(({ id, popper, children, ...props }, ref) => {
  useEffect(() => {
    if (popper?.scheduleUpdate) {
      popper.scheduleUpdate();
    }
  }, [children, popper?.scheduleUpdate]);

  return (
    <Popover id={id} ref={ref} body {...props}>
      {children}
    </Popover>
  );
});

CustomPopover.displayName = 'CustomPopover';
export default CustomPopover;
