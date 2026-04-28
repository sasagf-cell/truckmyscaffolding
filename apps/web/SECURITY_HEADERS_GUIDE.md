
# Security Headers & CSP Guide

## 1. Content Security Policy (CSP)
A strict CSP is implemented via a `<meta>` tag in `index.html` (and should be mirrored in backend HTTP headers):
- `default-src 'self'`
- `script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com`
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
- `img-src 'self' data: https:`
- `font-src 'self' https://fonts.gstatic.com`
- `connect-src 'self' https://api.stripe.com https://www.google-analytics.com`

## 2. Additional Security Headers (Backend Implementation Required)
The following headers should be configured on the Express.js backend or reverse proxy (Nginx/Caddy):
- **Strict-Transport-Security (HSTS):** `max-age=31536000; includeSubDomains`
- **X-Content-Type-Options:** `nosniff`
- **X-Frame-Options:** `SAMEORIGIN` (Prevents clickjacking)
- **Referrer-Policy:** `strict-origin-when-cross-origin`
- **Permissions-Policy:** `geolocation=(), microphone=(), camera=()`

*Note: As a frontend-only environment, we rely on meta tags where possible, but true security headers must be enforced by the server.*
