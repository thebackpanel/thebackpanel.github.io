// ============================================================
// BACKPANEL — TypeScript Strict Mode
// Full type safety, interfaces for all props/state
// ============================================================

/** Configuration for Google Forms integration */
interface GoogleFormConfig {
  readonly endpoint: string;
  readonly fields: {
    readonly name: string;
    readonly email: string;
    readonly org: string;
    readonly ack: string;
  };
}

/** Lead form data structure */
interface LeadFormData {
  name: string;
  company: string;
  email: string;
  hood: string;
  brief: string;
  ts: string;
}

/** Pitch submission data structure */
interface PitchFormData {
  founder_name: string;
  company: string;
  pitch_url: string;
}

/** Reach estimation result — CPM derived from our own rates, not assumed */
interface ReachResult {
  totalImpressions: number;
  estimatedCost: number;
  cpm: number;
  cpmLo: number;
  cpmHi: number;
}

/** Error boundary state */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/** Error boundary props */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/** Navigation scroll state */
interface NavScrollState {
  isScrolled: boolean;
}

/** Social badge visibility state */
interface SocialBadgeState {
  visible: boolean;
  opacity: number;
}
