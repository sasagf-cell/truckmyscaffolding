
# Accessibility (A11y) Guide

## 1. Semantic HTML
- Use `<main id="main-content">` to wrap the primary content of the page.
- Use `<header>`, `<nav>`, and `<footer>` for structural landmarks.
- Ensure exactly one `<h1>` per page.

## 2. Keyboard Navigation
- A visually hidden "Skip to main content" link (`SkipLink.jsx`) is available at the top of the DOM. It becomes visible on focus.
- All interactive elements (`<button>`, `<a>`, `<input>`) must be reachable via the `Tab` key.
- Focus states are explicitly styled using Tailwind's `focus-visible:ring-2` utilities.

## 3. Screen Reader Support
- Images must have descriptive `alt` text. Decorative images should use `alt=""` or `role="presentation"`.
- Icon-only buttons must include an `aria-label` (e.g., `<button aria-label="Close menu"><X /></button>`).
- Form inputs must have associated `<label>` elements or `aria-label` attributes.

## 4. Color Contrast
- Text must maintain a minimum contrast ratio of 4.5:1 against its background (WCAG AA).
- Large text (18pt or 14pt bold) requires a 3:1 ratio.
- The Tailwind color palette (`primary`, `secondary`, `muted`) has been calibrated to meet these standards.
