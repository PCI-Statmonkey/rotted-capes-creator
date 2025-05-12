import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { trackPageView } from '../lib/analytics';

/**
 * Hook to track page views in Google Analytics
 * This will automatically track page views when the location changes
 */
export const useAnalytics = () => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  
  useEffect(() => {
    if (location !== prevLocationRef.current) {
      trackPageView(location);
      prevLocationRef.current = location;
    }
  }, [location]);
};