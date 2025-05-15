/**
 * API utility functions for interacting with the backend
 */

// Record an analytics event
export const saveAnalyticsEvent = async (event: string, data: any, userId?: string) => {
  try {
    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        data,
        userId
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save analytics event');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving analytics event:', error);
    return null;
  }
};

// Fetch game content
export const fetchGameContent = async (contentType: string) => {
  try {
    const response = await fetch(`/api/game-content/${contentType}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${contentType}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${contentType}:`, error);
    return [];
  }
};

// Create game content
export const createGameContent = async (contentType: string, data: any) => {
  try {
    const response = await fetch(`/api/game-content/${contentType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create ${contentType}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error creating ${contentType}:`, error);
    throw error;
  }
};

// Update game content
export const updateGameContent = async (contentType: string, id: number, data: any) => {
  try {
    const response = await fetch(`/api/game-content/${contentType}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update ${contentType}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating ${contentType}:`, error);
    throw error;
  }
};

// Delete game content
export const deleteGameContent = async (contentType: string, id: number) => {
  try {
    const response = await fetch(`/api/game-content/${contentType}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete ${contentType}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting ${contentType}:`, error);
    throw error;
  }
};