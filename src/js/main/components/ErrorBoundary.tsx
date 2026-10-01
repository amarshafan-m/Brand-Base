import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: 'var(--text-main)' }}>
          <h2 style={{ marginBottom: '16px', color: 'var(--danger)' }}>Something went wrong.</h2>
          <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>The plugin encountered an unexpected error.</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reload Extension
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
