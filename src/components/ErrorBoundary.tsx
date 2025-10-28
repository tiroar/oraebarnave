import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#f5f5f5'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '600px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>😔</div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#D32F2F' }}>
              Diçka shkoi keq
            </h1>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              Aplikacioni ka hasur në një problem. Ju lutem rifreshoni faqen ose kontaktoni mbështetjen.
            </p>
            {this.state.error && (
              <details style={{
                background: '#FFEBEE',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '2rem',
                textAlign: 'left',
                fontSize: '0.9rem'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Detaje teknike (për zhvillues)
                </summary>
                <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.toString()}
                </code>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#4CAF50',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 600,
                padding: '1.5rem 2rem',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                width: '100%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              🔄 Rifresho Faqen
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

