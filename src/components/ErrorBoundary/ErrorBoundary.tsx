import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { VariantType } from '../../enums/type.enum';
import ButtonMui from '../Commons/Buttons/ButtonMui';

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
          className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-p-4"
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
          <div className="tw-flex tw-gap-2 tw-mt-3">
            <ButtonMui onClick={this.handleGoHome} label="Back to Home" />
            <ButtonMui
              variant={VariantType.Outlined}
              onClick={this.handleRefresh}
              startIcon={<RefreshIcon />}
              label="Refresh Page"
            />
          </div>
          {process.env.REACT_APP_DEPLOYMENT_MODE === 'development' && (
            <div className="tw-mt-4 tw-max-w-full tw-overflow-auto">
              <Typography variant="subtitle2" component="h3" gutterBottom>
                Error Details (Deployment Only):
              </Typography>
              {this.state.error && (
                <pre className="tw-bg-revert tw-p-2 tw-rounded-sm tw-max-w-full tw-overflow-x-auto tw-text-left">
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
