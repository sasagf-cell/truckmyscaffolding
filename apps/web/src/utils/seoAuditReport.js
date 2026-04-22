
import { 
  verifyMetaTags, 
  verifySchemaMarkup, 
  verifyImages, 
  verifyAccessibility, 
  verifyMobileOptimization 
} from './seoVerification.js';

export const generateSEOAuditReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    categories: {
      metaTags: verifyMetaTags(),
      schemaMarkup: verifySchemaMarkup(),
      images: verifyImages(),
      accessibility: verifyAccessibility(),
      mobileOptimization: verifyMobileOptimization()
    },
    summary: {
      totalIssues: 0,
      totalWarnings: 0,
      passedCategories: 0,
      totalCategories: 5
    }
  };

  Object.values(report.categories).forEach(category => {
    report.summary.totalIssues += category.issues.length;
    report.summary.totalWarnings += category.warnings.length;
    if (category.passed) report.summary.passedCategories += 1;
  });

  return report;
};
