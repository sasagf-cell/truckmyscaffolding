
# Mobile Optimization Guide

## 1. Viewport Configuration
The viewport is configured in `index.html` to ensure proper scaling:
`<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />`
*(Note: Restricting user scaling is generally discouraged for accessibility, but often required for native-feeling web apps. Ensure base font sizes are large enough to compensate).*

## 2. Touch Targets
- All buttons, links, and interactive elements must have a minimum touch area of 44x44px (Apple HIG) or 48x48px (Material Design).
- Use Tailwind padding utilities (`p-2`, `p-3`) to expand clickable areas without changing visual size.

## 3. Typography
- Base font size is set to 16px (`text-base`) to prevent iOS Safari from auto-zooming when form inputs are focused.
- Headings use responsive text utilities (e.g., `text-3xl md:text-4xl lg:text-5xl`).

## 4. Layout
- The application uses a mobile-first approach. Default classes apply to mobile, while `md:` and `lg:` prefixes handle larger screens.
- The dashboard features a bottom navigation bar on mobile devices, switching to a sidebar on desktop viewports.
