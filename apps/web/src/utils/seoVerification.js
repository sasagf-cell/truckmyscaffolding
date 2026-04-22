
/**
 * Utility functions to verify SEO, Accessibility, and Performance best practices on the current page.
 */

export const verifyMetaTags = () => {
  const issues = [];
  const warnings = [];
  
  const title = document.querySelector('title');
  if (!title || !title.innerText) issues.push('Missing <title> tag');
  else if (title.innerText.length < 10 || title.innerText.length > 60) warnings.push('Title length should be between 10 and 60 characters');

  const description = document.querySelector('meta[name="description"]');
  if (!description || !description.getAttribute('content')) issues.push('Missing meta description');
  else if (description.getAttribute('content').length < 50 || description.getAttribute('content').length > 160) warnings.push('Meta description length should be between 50 and 160 characters');

  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical || !canonical.getAttribute('href')) issues.push('Missing canonical URL');

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) issues.push('Missing og:title');

  const ogImage = document.querySelector('meta[property="og:image"]');
  if (!ogImage) issues.push('Missing og:image');

  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) issues.push('Missing viewport meta tag');

  return {
    passed: issues.length === 0,
    issues,
    warnings
  };
};

export const verifySchemaMarkup = () => {
  const issues = [];
  const warnings = [];
  
  const schemas = document.querySelectorAll('script[type="application/ld+json"]');
  if (schemas.length === 0) {
    issues.push('No JSON-LD schema markup found on the page');
  } else {
    schemas.forEach((schema, index) => {
      try {
        const parsed = JSON.parse(schema.innerText);
        if (!parsed['@context'] || !parsed['@type']) {
          issues.push(`Schema #${index + 1} is missing @context or @type`);
        }
      } catch (e) {
        issues.push(`Schema #${index + 1} contains invalid JSON`);
      }
    });
  }

  return {
    passed: issues.length === 0,
    issues,
    warnings
  };
};

export const verifyImages = () => {
  const issues = [];
  const warnings = [];
  
  const images = document.querySelectorAll('img');
  if (images.length === 0) warnings.push('No images found on the page');

  images.forEach((img, index) => {
    const src = img.getAttribute('src') || `Image #${index + 1}`;
    
    if (!img.hasAttribute('alt')) {
      issues.push(`Missing alt attribute on image: ${src}`);
    } else {
      const alt = img.getAttribute('alt');
      if (alt.trim() === '' && !img.getAttribute('role') === 'presentation') {
        warnings.push(`Empty alt attribute on non-presentation image: ${src}`);
      }
      if (alt.toLowerCase().includes('image') || alt.toLowerCase().includes('picture')) {
        warnings.push(`Alt text contains redundant words ("image"/"picture"): ${src}`);
      }
    }

    if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
      warnings.push(`Missing explicit width/height attributes (causes layout shift): ${src}`);
    }

    // Check lazy loading for images below the fold (heuristic: not the first image)
    if (index > 0 && !img.hasAttribute('loading')) {
      warnings.push(`Consider adding loading="lazy" to below-the-fold image: ${src}`);
    }
  });

  return {
    passed: issues.length === 0,
    issues,
    warnings
  };
};

export const verifyAccessibility = () => {
  const issues = [];
  const warnings = [];
  
  // Heading hierarchy
  const h1s = document.querySelectorAll('h1');
  if (h1s.length === 0) issues.push('Missing <h1> tag');
  if (h1s.length > 1) warnings.push('Multiple <h1> tags found. Best practice is one per page.');

  // Buttons and Links
  const buttons = document.querySelectorAll('button');
  buttons.forEach((btn, index) => {
    if (!btn.innerText.trim() && !btn.getAttribute('aria-label') && !btn.getAttribute('aria-labelledby')) {
      issues.push(`Button #${index + 1} has no accessible name (text or aria-label)`);
    }
  });

  const links = document.querySelectorAll('a');
  links.forEach((link, index) => {
    if (!link.innerText.trim() && !link.getAttribute('aria-label') && !link.getAttribute('aria-labelledby')) {
      issues.push(`Link #${index + 1} has no accessible name`);
    }
    if (link.getAttribute('href') === '#' || link.getAttribute('href') === 'javascript:void(0)') {
      warnings.push(`Link #${index + 1} uses a placeholder href. Consider using a button instead.`);
    }
  });

  // Form inputs
  const inputs = document.querySelectorAll('input:not([type="hidden"]), textarea, select');
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id');
    let hasLabel = false;
    if (id) {
      hasLabel = document.querySelector(`label[for="${id}"]`) !== null;
    }
    if (!hasLabel && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
      issues.push(`Form input #${index + 1} (${input.getAttribute('name') || 'unnamed'}) has no associated label`);
    }
  });

  return {
    passed: issues.length === 0,
    issues,
    warnings
  };
};

export const verifyMobileOptimization = () => {
  const issues = [];
  const warnings = [];
  
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    issues.push('Missing viewport meta tag');
  } else {
    const content = viewport.getAttribute('content');
    if (!content.includes('width=device-width')) issues.push('Viewport missing width=device-width');
    if (!content.includes('initial-scale=1')) issues.push('Viewport missing initial-scale=1');
    if (content.includes('maximum-scale=1') || content.includes('user-scalable=no')) {
      warnings.push('Viewport restricts zooming (maximum-scale=1 or user-scalable=no), which harms accessibility');
    }
  }

  // Touch targets heuristic
  const touchTargets = document.querySelectorAll('button, a, input, select, textarea');
  touchTargets.forEach((target, index) => {
    const rect = target.getBoundingClientRect();
    // Only check visible elements
    if (rect.width > 0 && rect.height > 0) {
      if (rect.width < 44 || rect.height < 44) {
        warnings.push(`Touch target too small (< 44px): ${target.tagName} #${index + 1} (${Math.round(rect.width)}x${Math.round(rect.height)})`);
      }
    }
  });

  return {
    passed: issues.length === 0,
    issues,
    warnings
  };
};
