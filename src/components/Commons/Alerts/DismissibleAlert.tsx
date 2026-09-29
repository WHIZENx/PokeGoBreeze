import React, { useEffect, useState } from 'react';
import { Alert, AlertProps } from '@mui/material';

interface DismissibleAlertProps extends Omit<AlertProps, 'onClose'> {
  resetKey?: string | number;
}

const DismissibleAlert = ({ resetKey, ...props }: DismissibleAlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, [resetKey]);

  if (!isVisible) {
    return null;
  }

  return <Alert {...props} onClose={() => setIsVisible(false)} />;
};

export default DismissibleAlert;
