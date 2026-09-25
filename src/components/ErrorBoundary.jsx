import { Component } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import logger from '../utils/logger.js';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Logs to console (and wherever your logger is wired) so you can
    // still see the real stack trace during development.
    logger.error('Uncaught render error', {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
    });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/15">
              <AlertTriangle className="h-7 w-7 text-rose-400" />
            </div>

            <h1 className="mt-6 font-display text-2xl text-white">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm text-white/60">
              An unexpected error stopped this page from loading. Reloading
              usually fixes it.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-black/40 p-3 text-left text-xs text-rose-300">
                {this.state.error.message}
              </pre>
            )}

            <button
              onClick={this.handleReload}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400"
            >
              <RotateCw className="h-4 w-4" />
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
