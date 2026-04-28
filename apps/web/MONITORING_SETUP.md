
# Monitoring & Analytics Setup

## 1. Google Analytics 4 (GA4)
- GA4 is initialized via `analyticsSetup.js`.
- The Measurement ID should be provided via the `VITE_GA_MEASUREMENT_ID` environment variable.
- Page views are tracked automatically on route changes using the `useAnalytics` hook.
- Custom events can be tracked using `trackEvent(action, category, label, value)`.

## 2. Core Web Vitals Tracking
- The `PerformanceMonitor.jsx` component uses the `web-vitals` library to measure LCP, FID, CLS, FCP, and TTFB.
- Metrics are sent to GA4 as custom events with the category "Web Vitals".
- Console warnings are triggered in development if metrics exceed recommended thresholds (e.g., LCP > 2.5s).

## 3. Google Search Console (GSC)
To set up GSC:
1. Go to Google Search Console and add your domain property.
2. Verify ownership using a DNS TXT record or HTML meta tag.
3. Submit the `sitemap.xml` located at `https://trackmyscaffolding.com/sitemap.xml`.
4. Monitor the "Core Web Vitals" and "Mobile Usability" reports weekly.
