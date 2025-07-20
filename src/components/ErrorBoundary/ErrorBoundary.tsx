import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { VariantType } from '../../enums/type.enum';
import ButtonMui from '../Commons/Button/ButtonMui';

interface Props {
  children: ReactNode;
  fallbackUI?: ReactNode;
}

interface IState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class State implements IState {
  hasError = false;
  error: Error | null = null;
  errorInfo: ErrorInfo | null = null;

  static create(result: IState) {
    const obj = new State();
    Object.assign(obj, result);
    return obj;
  }
}

class ErrorBoundary extends Component<Props, IState> {
  constructor(props: Props) {
    super(props);
    this.state = new State();
  }

  static getDerivedStateFromError(error: Error) {
    return State.create({ hasError: true, error, errorInfo: null });
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState(
      State.create({
        hasError: true,
        error,
        errorInfo,
      })
    );
  }

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackUI) {
        return this.props.fallbackUI;
      }

      return (
        <div
          className="d-flex flex-column align-items-center justify-content-center text-center p-4"
          style={{
            minHeight: '50vh',
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" gutterBottom>
            The application encountered an error.
          </Typography>
          <div className="d-flex gap-2 mt-3">
            <ButtonMui onClick={this.handleGoHome} label="Back to Home" />
            <ButtonMui
              variant={VariantType.Outlined}
              onClick={this.handleRefresh}
              startIcon={<RefreshIcon />}
              label="Refresh Page"
            />
          </div>
          {process.env.REACT_APP_DEPLOYMENT_MODE === 'development' && (
            <div className="mt-4 mw-100 overflow-auto">
              <Typography variant="subtitle2" component="h3" gutterBottom>
                Error Details (Deployment Only):
              </Typography>
              {this.state.error && (
                <pre className="theme-custom-selected-bg p-2 rounded-1 mw-100 overflow-x-auto text-start">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
