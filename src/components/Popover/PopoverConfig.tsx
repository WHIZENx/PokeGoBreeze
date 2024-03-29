import React, { forwardRef, useEffect } from 'react';
import { Popover } from 'react-bootstrap';

const PopoverConfig = forwardRef(({ id, popper, children, ...props }: any, ref) => {
  useEffect(() => {
    popper.scheduleUpdate();
  }, [children, popper]);

  return (
    <Popover id={id} ref={ref} body={true} {...props}>
      {children}
    </Popover>
  );
});

PopoverConfig.displayName = 'PopoverConfig';
export default PopoverConfig;
