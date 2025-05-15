import { queryClient } from "./queryClient";

// Base API URL for the development environment
const baseUrl = "/api";

/**
 * Generic fetch wrapper for API requests
 */
const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "An error occurred with the API request");
  }

  return response.json();
};

/**
 * GET request helper
 */
export const get = <T>(endpoint: string): Promise<T> => {
  return fetchApi<T>(endpoint);
};

/**
 * POST request helper
 */
export const post = <T>(endpoint: string, data: any): Promise<T> => {
  return fetchApi<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * PUT request helper
 */
export const put = <T>(endpoint: string, data: any): Promise<T> => {
  return fetchApi<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * PATCH request helper
 */
export const patch = <T>(endpoint: string, data: any): Promise<T> => {
  return fetchApi<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request helper
 */
export const del = <T>(endpoint: string): Promise<T> => {
  return fetchApi<T>(endpoint, {
    method: "DELETE",
  });
};

/**
 * Analytics event tracking helper
 */
export const saveAnalyticsEvent = async (
  event: string, 
  data: any, 
  userId?: string
): Promise<any> => {
  try {
    return await post('/analytics/events', {
      event,
      data,
      userId
    });
  } catch (error) {
    console.error('Failed to save analytics event:', error);
    return null;
  }
};

/**
 * Character tracking helper
 */
export const trackCharacterEvent = async (
  event: string, 
  characterData: any, 
  userId?: string
): Promise<any> => {
  try {
    return await saveAnalyticsEvent(`character_${event}`, characterData, userId);
  } catch (error) {
    console.error('Failed to track character event:', error);
    return null;
  }
};