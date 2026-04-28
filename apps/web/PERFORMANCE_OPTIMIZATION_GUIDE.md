
# Performance Optimization Guide

## 1. Code Splitting
We use `React.lazy()` and `Suspense` in `App.jsx` to split the application into smaller chunks. 
- **Public Routes:** Landing pages, pricing, and contact pages are loaded on demand.
- **Protected Routes:** Dashboard modules (Site Diary, Material Deliveries, Reports) are lazy-loaded to keep the initial bundle size small.

## 2. Image Optimization
- **Formats:** We use the `<picture>` element to serve WebP images with standard fallbacks.
- **Lazy Loading:** Native `loading="lazy"` is applied to all images below the fold.
- **Preloading:** The LCP (Largest Contentful Paint) hero image is preloaded in `index.html`.
- **Dimensions:** Explicit `width` and `height` attributes prevent Cumulative Layout Shift (CLS).

## 3. CSS and JavaScript
- **Minification:** Vite automatically minifies CSS and JS using esbuild/Terser during the production build.
- **Tailwind Purge:** Tailwind CSS is configured to purge unused classes, resulting in a minimal CSS payload.
- **Deferring:** Non-critical scripts (like Google Analytics) are loaded asynchronously.

## 4. Core Web Vitals Monitoring
The `PerformanceMonitor.jsx` component uses the `web-vitals` library to track:
- **LCP (Largest Contentful Paint):** Target < 2.5s
- **FID (First Input Delay):** Target < 100ms
- **CLS (Cumulative Layout Shift):** Target < 0.1
Metrics are logged to the console in development and sent to Google Analytics in production.

## 5. Caching Strategy
- **Service Worker:** A service worker caches the app shell and static assets for offline support and faster repeat visits.
- **Cache Headers:** (Backend configuration required) Static assets should be served with `Cache-Control: public, max-age=31536000, immutable`.
