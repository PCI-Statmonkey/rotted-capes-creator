import { Request, Response } from 'express';
import { db } from '../db';
import { characters } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Controller for character-related database operations
 * This works alongside Firebase to provide robust data storage
 */

// Get all characters (with optional user filter)
export const getCharacters = async (req: Request, res: Response) => {
  try {
    // Allow filtering by userId
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    
    let query = db.select().from(characters);
    
    if (userId) {
      query = query.where(eq(characters.userId, userId));
    }
    
    const result = await query;
    res.json(result);
  } catch (error) {
    console.error('Error getting characters:', error);
    res.status(500).json({ error: 'Failed to retrieve characters' });
  }
};

// Get a single character by ID
export const getCharacter = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    const [character] = await db.select()
      .from(characters)
      .where(eq(characters.id, id));
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json(character);
  } catch (error) {
    console.error('Error getting character:', error);
    res.status(500).json({ error: 'Failed to retrieve character' });
  }
};

// Create a new character
export const createCharacter = async (req: Request, res: Response) => {
  try {
    const { userId, name, data } = req.body;
    
    // Validate required fields
    if (!userId || !name || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const [character] = await db.insert(characters)
      .values({
        userId: Number(userId),
        name,
        data
      })
      .returning();
    
    res.status(201).json(character);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
};

// Update an existing character
export const updateCharacter = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, data } = req.body;
    
    // Get the character to make sure it exists and belongs to the user
    const [existingCharacter] = await db.select()
      .from(characters)
      .where(eq(characters.id, id));
    
    if (!existingCharacter) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Optional: Check if user has permission (e.g., character belongs to user)
    // if (existingCharacter.userId !== req.user.id) {
    //   return res.status(403).json({ error: 'Not authorized to update this character' });
    // }
    
    const [updatedCharacter] = await db.update(characters)
      .set({
        name: name || existingCharacter.name,
        data: data || existingCharacter.data,
        updatedAt: new Date()
      })
      .where(eq(characters.id, id))
      .returning();
    
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ error: 'Failed to update character' });
  }
};

// Delete a character
export const deleteCharacter = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    // Get the character to make sure it exists
    const [existingCharacter] = await db.select()
      .from(characters)
      .where(eq(characters.id, id));
    
    if (!existingCharacter) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Optional: Check if user has permission
    // if (existingCharacter.userId !== req.user.id) {
    //   return res.status(403).json({ error: 'Not authorized to delete this character' });
    // }
    
    await db.delete(characters)
      .where(eq(characters.id, id));
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
};