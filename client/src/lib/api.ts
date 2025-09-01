/**
 * API utility functions for interacting with the backend
 */
import { getSampleData, getSampleItemById } from './fallbackData';
import { apiRequest } from './queryClient';

// Track if we're using fallback data due to database connection issues
export let usingFallbackData = false;

/**
 * Helper to check if user is admin from localStorage
 */
const getAdminCredentials = () => {
  try {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      if (userData?.email === 'admin@rottedcapes.com') {
        return { isAdmin: true, adminEmail: userData.email };
      }
    }
    
    // Check for Opera browser admin login
    const operaAdminString = localStorage.getItem('operaAdmin');
    if (operaAdminString) {
      const operaAdmin = JSON.parse(operaAdminString);
      if (operaAdmin?.email === 'admin@rottedcapes.com') {
        return { isAdmin: true, adminEmail: operaAdmin.email };
      }
    }
    
    return { isAdmin: false };
  } catch (e) {
    console.error('Error checking admin status:', e);
    return { isAdmin: false };
  }
};

/**
 * Generic function to handle API request errors
 */
const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  throw new Error(error.message || 'An unknown error occurred');
};

/**
 * Save an analytics event to the backend
 */
export const saveAnalyticsEvent = async (
  event: string, 
  data: any, 
  userId?: string
): Promise<any> => {
  try {
    const response = await apiRequest('POST', '/api/analytics/events', {
      event,
      data,
      userId,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save analytics event');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to save analytics event:', error);
    // Return empty object instead of throwing to avoid disrupting app flow
    return {};
  }
};

/**
 * Get analytics summary data
 */
export const getAnalyticsSummary = async (): Promise<any> => {
  try {
    const response = await apiRequest('GET', '/api/analytics/summary');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch analytics data');
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get all game content of a specific type
 */
export const getGameContent = async (contentType: string): Promise<any[]> => {
  try {
    const response = await apiRequest('GET', `/api/game-content/${contentType}`);
    const data = await response.json();

    // If the server returns no data, fall back to sample content
    if (Array.isArray(data) && data.length === 0) {
      usingFallbackData = true;
      return getSampleData(contentType);
    }

    // Reset fallback flag if we successfully got data
    usingFallbackData = false;
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${contentType}:`, error);

    // Set flag so UI can show appropriate messaging
    usingFallbackData = true;

    // Return sample data as fallback
    return getSampleData(contentType);
  }
};

/**
 * Get a specific game content item by ID
 */
export const getGameContentById = async (contentType: string, id: number): Promise<any> => {
  try {
    const response = await apiRequest('GET', `/api/game-content/${contentType}/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch ${contentType} with ID ${id}`);
    }

    // Reset fallback flag if we successfully got data
    usingFallbackData = false;
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${contentType} with ID ${id}:`, error);
    
    // Set flag so UI can show appropriate messaging
    usingFallbackData = true;
    
    // Return sample item as fallback
    return getSampleItemById(contentType, id);
  }
};

/**
 * Create a new game content item
 */
export const createGameContent = async (contentType: string, data: any): Promise<any> => {
  // If we're using fallback data, we can't create new items
  if (usingFallbackData) {
    throw new Error(`Cannot create ${contentType} while database is unavailable.`);
  }
  
  const { isAdmin, adminEmail } = getAdminCredentials();
  if (!isAdmin) {
    throw new Error('Admin access required to create content.');
  }
  
  try {
    const response = await apiRequest(
      'POST',
      `/api/game-content/${contentType}`,
      data,
      { 'X-Admin-Email': adminEmail }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create ${contentType}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to create ${contentType}:`, error);
    throw error;
  }
};

/**
 * Update an existing game content item
 */
export const updateGameContent = async (contentType: string, id: number, data: any): Promise<any> => {
  // If we're using fallback data, we can't update items
  if (usingFallbackData) {
    throw new Error(`Cannot update ${contentType} while database is unavailable.`);
  }

  const { isAdmin, adminEmail } = getAdminCredentials();
  if (!isAdmin) {
    throw new Error('Admin access required to update content.');
  }

  try {
    const response = await apiRequest(
      'PATCH',
      `/api/game-content/${contentType}/${id}`,
      data,
      { 'X-Admin-Email': adminEmail }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update ${contentType} with ID ${id}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to update ${contentType} with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a game content item
 */
export const deleteGameContent = async (contentType: string, id: number): Promise<void> => {
  // If we're using fallback data, we can't delete items
  if (usingFallbackData) {
    throw new Error(`Cannot delete ${contentType} while database is unavailable.`);
  }

  const { isAdmin, adminEmail } = getAdminCredentials();
  if (!isAdmin) {
    throw new Error('Admin access required to delete content.');
  }

  try {
    const response = await apiRequest(
      'DELETE',
      `/api/game-content/${contentType}/${id}`,
      undefined,
      { 'X-Admin-Email': adminEmail }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete ${contentType} with ID ${id}`);
    }
  } catch (error) {
    console.error(`Failed to delete ${contentType} with ID ${id}:`, error);
    throw error;
  }
};