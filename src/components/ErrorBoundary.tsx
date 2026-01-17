import React from "react";

type FallbackRender = (error: unknown) => React.ReactNode;

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  fallbackRender?: FallbackRender;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: unknown;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    // Keep this log: it surfaces in Lovable console logs and helps debug white screens.
    console.error("ErrorBoundary caught error:", error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackRender) return this.props.fallbackRender(this.state.error);
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}
