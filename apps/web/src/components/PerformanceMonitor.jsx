
import React, { useEffect } from 'react';
import { onCLS, onFID, onLCP, onTTFB, onFCP } from 'web-vitals';
import { logWebVitals } from '@/utils/analyticsSetup.js';

const PerformanceMonitor = () => {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      // Log to console in development, send to analytics in production
      const handleMetric = (metric) => {
        if (import.meta.env.DEV) {
          console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric);
        }
        
        // Alert on poor performance
        if (metric.name === 'LCP' && metric.value > 2500) {
          console.warn('Poor LCP detected (>2.5s):', metric.value);
        }
        if (metric.name === 'CLS' && metric.value > 0.1) {
          console.warn('Poor CLS detected (>0.1):', metric.value);
        }

        logWebVitals(metric);
      };

      onCLS(handleMetric);
      onFID(handleMetric);
      onLCP(handleMetric);
      onTTFB(handleMetric);
      onFCP(handleMetric);
    }
  }, []);

  return null; // This is a headless component
};

export default PerformanceMonitor;
