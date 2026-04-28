import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  id?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div id={this.props.id} className="min-h-screen flex items-center justify-center bg-brand-cream p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center space-y-6">
            <h2 className="text-2xl font-serif font-bold text-brand-olive">Something went wrong</h2>
            <div className="text-left bg-red-50 p-4 rounded-xl overflow-auto max-h-40">
              <p className="text-xs font-mono text-red-600">
                {this.state.error?.message}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-brand-gold text-brand-olive px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-olive hover:text-brand-cream transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
