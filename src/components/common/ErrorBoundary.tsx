import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  key?: React.Key;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State;
  public props: Props;
  public setState!: (state: Partial<State> | ((prevState: State) => Partial<State>)) => void;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error trapped by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[380px] w-full flex items-center justify-center p-6 animate-in fade-in">
          <div
            className="w-full max-w-lg p-6 rounded-2xl border shadow-xl space-y-4"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          >
            <div className="flex items-start gap-3.5">
              <div
                className="p-3 rounded-xl shrink-0"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-critical) 15%, transparent)',
                  color: 'var(--color-critical)'
                }}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-text-primary tracking-tight">
                  {this.props.fallbackTitle || 'Operational View Exception Handled'}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {this.props.fallbackSubtitle ||
                    'An unexpected exception was caught during view computation. The control tower isolated this error to maintain system stability.'}
                </p>
              </div>
            </div>

            {this.state.error && (
              <div
                className="p-3 rounded-xl border text-[11px] font-mono overflow-x-auto max-h-32 select-all"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-critical)'
                }}
              >
                {this.state.error.name}: {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <button
                onClick={this.handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-surface text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Safe State</span>
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer hover:opacity-90"
                style={{
                  backgroundColor: 'var(--color-brand)',
                  color: 'var(--color-brand-contrast)'
                }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Workspace</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
