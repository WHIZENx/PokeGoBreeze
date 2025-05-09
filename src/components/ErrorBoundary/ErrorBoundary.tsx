import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  children: ReactNode;
  fallbackUI?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleRefresh = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
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
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <Button variant="contained" color="primary" onClick={this.handleGoHome}>
              Back to Home
            </Button>
            <Button variant="outlined" color="primary" onClick={this.handleRefresh} startIcon={<RefreshIcon />}>
              Refresh Page
            </Button>
          </div>
          {this.state.error && (
            <div style={{ marginTop: '20px', textAlign: 'left', maxWidth: '100%', overflow: 'auto' }}>
              <Typography variant="subtitle2" component="h3" gutterBottom>
                Error Details:
              </Typography>
              <pre
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '10px',
                  borderRadius: '4px',
                  overflowX: 'auto',
                  maxWidth: '100%',
                }}
              >
                {this.state.error?.toString()}
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
