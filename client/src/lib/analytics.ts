import { saveAnalyticsEvent } from "./api";

// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });
};

// Track a general event
export const trackEvent = async (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  try {
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
    
    // Also send to our own analytics backend
    return await saveAnalyticsEvent('ui_event', {
      action,
      category,
      label,
      value
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    return null;
  }
};

// Track a character-related event
export const trackCharacterEvent = async (
  event: string, 
  characterData: any, 
  userId?: string
): Promise<any> => {
  try {
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', `character_${event}`, {
        event_category: 'character',
        event_label: characterData.name || 'Unknown',
      });
    }
    
    // Also send to our own analytics backend
    return await saveAnalyticsEvent(`character_${event}`, characterData, userId);
  } catch (error) {
    console.error('Failed to track character event:', error);
    return null;
  }
};