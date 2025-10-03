declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEventParams = Record<string, string | number | boolean | undefined>;

export const trackEvent = (action: string, params: AnalyticsEventParams = {}) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.gtag?.('event', action, params);
};

