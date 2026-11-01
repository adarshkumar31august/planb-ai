import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('PlanB AI Uncaught Exception caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleResetWorkspace = (): void => {
    try {
      localStorage.removeItem('planb_ai_events_v1');
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-charcoal-200 shadow-elevated p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-charcoal-900">
                Workspace Recovery Mode
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                PlanB AI encountered an unexpected rendering exception. Your underlying event data is protected.
              </p>
              {this.state.error?.message && (
                <p className="text-xs font-mono text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 truncate">
                  {this.state.error.message}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-violet-800 hover:bg-violet-900 shadow-subtle transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload App</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetWorkspace}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-charcoal-600 hover:bg-charcoal-100 transition-colors border border-charcoal-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
