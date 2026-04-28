
# SEO Verification Checklist

## 1. Meta Tags & Head
- [x] `<title>` tag is present, unique, and between 10-60 characters.
- [x] `<meta name="description">` is present, unique, and between 50-160 characters.
- [x] `<link rel="canonical">` points to the preferred URL.
- [x] Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) are present.
- [x] Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) are present.
- [x] Hreflang tags are implemented for multi-language support (`en`, `de`, `x-default`).

## 2. Schema Markup
- [x] JSON-LD schema is injected via `react-helmet-async`.
- [x] Schema type is appropriate (e.g., `SoftwareApplication`, `Organization`).
- [x] Schema validates without errors in Google Rich Results Test.

## 3. Image Optimization
- [x] All images have descriptive `alt` attributes.
- [x] Below-the-fold images use `loading="lazy"`.
- [x] Hero images are preloaded via `<link rel="preload" as="image">`.
- [x] Images use `<picture>` tags with WebP sources and JPG/PNG fallbacks.
- [x] Explicit `width` and `height` attributes are set to prevent Cumulative Layout Shift (CLS).

## 4. Accessibility (A11y)
- [x] Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<footer>`) are used.
- [x] Heading hierarchy is logical (H1 -> H2 -> H3) with no skipped levels.
- [x] Interactive elements (buttons, links) have accessible names (`aria-label` or text).
- [x] Color contrast meets WCAG AA standards (4.5:1 for normal text).
- [x] "Skip to main content" link is implemented for keyboard navigation.
- [x] Focus indicators are visible on all interactive elements.

## 5. Mobile Optimization
- [x] Viewport meta tag is set: `width=device-width, initial-scale=1`.
- [x] Touch targets are at least 44x44px (preferably 48x48px).
- [x] Base font size is at least 16px to prevent iOS zoom on focus.
- [x] No horizontal scrolling occurs on mobile viewports (320px+).

## 6. Performance
- [x] Code splitting is implemented via `React.lazy()` and `Suspense`.
- [x] Core Web Vitals (LCP, FID, CLS) are monitored via `web-vitals` library.
- [x] Google Fonts use `font-display: swap` and are preconnected.
