import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

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
    console.error('ErrorBoundary caught an error', error, errorInfo);
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
          style={{
            padding: '20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" gutterBottom>
            The application encountered an error.
          </Typography>
          <div className="d-flex gap-10 mt-3" style={{ gap: '10px' }}>
            <Button variant="contained" color="primary" onClick={this.handleGoHome}>
              Back to Home
            </Button>
            <Button variant="outlined" color="primary" onClick={this.handleRefresh} startIcon={<RefreshIcon />}>
              Refresh Page
            </Button>
          </div>
          {this.state.error && process.env.REACT_APP_DEPLOYMENT_MODE === 'development' && (
            <div style={{ marginTop: '20px', textAlign: 'left', maxWidth: '100%', overflow: 'auto' }}>
              <Typography variant="subtitle2" component="h3" gutterBottom>
                Error Details (Deployment Only):
              </Typography>
              <pre
                className="theme-custom-selected-bg p-2"
                style={{
                  borderRadius: '4px',
                  overflowX: 'auto',
                  maxWidth: '100%',
                }}
              >
                {this.state.error.toString()}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
