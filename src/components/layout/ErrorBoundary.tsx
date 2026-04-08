import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-pardus-bg">
          <div className="card-pardus p-8 max-w-md">
            <h2 className="text-xl font-bold text-pardus-secondary mb-4">
              Bir hata oluştu
            </h2>
            <p className="text-pardus-text mb-4">
              Uygulamada beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.
            </p>
            <button
              className="btn-pardus"
              onClick={() => window.location.reload()}
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}