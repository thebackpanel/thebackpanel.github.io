// ============================================================
// BACKPANEL — Error Boundary Component
// Global error catching with branded fallback UI
// ============================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    // Log to error reporting service in production
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "clamp(24px, 4vw, 40px)",
            fontFamily: "'Inter', system-ui, sans-serif",
            background: "#fafafa",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: "rgba(255, 77, 0, 0.08)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
              marginBottom: 24,
            }}
            aria-hidden="true"
          >
            ⚠️
          </div>
          <div
            style={{
              fontSize: "clamp(4rem, 15vw, 8rem)",
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.05em",
              color: "#ff4d00",
              marginBottom: 16,
            }}
            aria-hidden="true"
          >
            500
          </div>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 16,
            }}
          >
            Something went wrong.
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: "#64748b",
              maxWidth: 480,
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Our team has been notified. In the meantime, try refreshing the page or heading back home.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={this.handleReset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#ff4d00",
                color: "#fff",
                padding: "18px 32px",
                fontWeight: 800,
                fontSize: 16,
                borderRadius: 10,
                letterSpacing: "0.5px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(255, 77, 0, 0.3)",
                minHeight: 52,
              }}
            >
              TRY AGAIN
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                color: "#0f172a",
                padding: "18px 32px",
                fontWeight: 800,
                fontSize: 16,
                borderRadius: 10,
                letterSpacing: "0.5px",
                border: "2px solid #0f172a",
                textDecoration: "none",
                minHeight: 52,
              }}
            >
              BACK TO HOME
            </a>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details
              style={{
                marginTop: 32,
                padding: 16,
                background: "#f1f5f9",
                borderRadius: 8,
                maxWidth: 600,
                width: "100%",
                textAlign: "left",
                fontSize: 13,
                fontFamily: "monospace",
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: 700, marginBottom: 8 }}>
                Error Details (Development Only)
              </summary>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: "#dc2626",
                  margin: 0,
                }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
