import React, { createContext, useContext, useState } from 'react';
import {
  Alert,
  AlertColor,
  Grow,
  Snackbar,
  SnackbarCloseReason,
  SnackbarProps,
  Slide,
  Fade,
  SlideProps,
  SnackbarOrigin,
} from '@mui/material';

// Define types for our snackbar context
interface SnackbarContextType {
  // Methods to control the snackbar
  setSnackbar: (options?: SnackbarProps) => void;
  showSnackbar: (message: string, severity?: AlertColor, variant?: 'standard' | 'filled' | 'outlined') => void;
  closeSnackbar: () => void;
}

// Create the context with default values
export const SnackbarContext = createContext<SnackbarContextType>({
  setSnackbar: () => {
    return true;
  },
  showSnackbar: () => {
    return true;
  },
  closeSnackbar: () => {
    return true;
  },
});

interface ISnackbarProps extends SnackbarProps {
  severity?: AlertColor;
  variant?: 'standard' | 'filled' | 'outlined';
  transition?: 'grow' | 'fade' | 'slide';
  timeOut?: number;
}

export const SnackbarProvider: React.FC<ISnackbarProps> = (props: ISnackbarProps) => {
  const anchorOrigin = props.anchorOrigin || {
    vertical: 'bottom',
    horizontal: 'right',
  };

  const setDirectionSlide = (anchorOrigin: SnackbarOrigin) => {
    return anchorOrigin.vertical === 'bottom' ? 'up' : 'down';
  };

  const SlideTransition = (propsSlide: SlideProps) => {
    return <Slide direction={setDirectionSlide(anchorOrigin)} {...propsSlide} />;
  };

  // State for snackbar
  const [option, setOption] = useState<ISnackbarProps>({
    ...props,
    open: false,
    message: '',
    autoHideDuration: props.timeOut || 5000,
    TransitionComponent: props.transition === 'grow' ? Grow : props.transition === 'fade' ? Fade : SlideTransition,
    anchorOrigin,
  });

  // Method to set snackbar
  const setSnackbar = (options?: SnackbarProps) => {
    if (options) {
      setOption(options);
    }
  };

  // Method to show snackbar
  const showSnackbar = (message: string, severity?: AlertColor, variant?: 'standard' | 'filled' | 'outlined') => {
    if (option.open) {
      closeSnackbar();
      setTimeout(() => {
        setOption((option) => ({ ...option, message, severity, variant, open: true }));
      }, 100);
    } else {
      setOption((option) => ({ ...option, message, severity, variant, open: true }));
    }
  };

  // Method to close snackbar
  const closeSnackbar = () => {
    setOption((option) => ({ ...option, open: false }));
  };

  // Handle close event
  const handleClose = (_: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    closeSnackbar();
  };

  return (
    <SnackbarContext.Provider value={{ setSnackbar, showSnackbar, closeSnackbar }}>
      {props.children}
      <Snackbar {...option} onClose={handleClose}>
        <Alert onClose={handleClose} severity={option.severity} variant={option.variant} sx={option.sx}>
          {option.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

// Create a custom hook to use the snackbar context
export const useSnackbar = () => useContext(SnackbarContext);
