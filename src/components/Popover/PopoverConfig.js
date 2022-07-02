import { forwardRef, useEffect } from "react";
import { Popover } from "react-bootstrap";

const PopoverConfig = forwardRef(
    ({ id, popper, children, show: _, ...props }, ref) => {
      useEffect(() => {
        popper.scheduleUpdate();
      }, [children, popper]);

      return (
        <Popover id={id} ref={ref} body {...props}>
          {children}
        </Popover>
      );
    },
);

export default PopoverConfig;