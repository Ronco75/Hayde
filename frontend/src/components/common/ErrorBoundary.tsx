import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (in production, send to error tracking service)
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              משהו השתבש
            </h1>

            <p className="text-gray-600 mb-6">
              אירעה שגיאה לא צפויה. אנא נסה לרענן את הדף.
            </p>

            {this.state.error && import.meta.env.DEV && (
              <div className="bg-gray-100 rounded p-4 mb-6 text-left overflow-auto max-h-40">
                <p className="text-sm font-mono text-gray-700 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                רענן דף
              </button>

              <button
                onClick={this.handleReset}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                נסה שוב
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
