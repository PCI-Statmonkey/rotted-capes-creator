import { Request, Response } from 'express';
import { db } from '../db';
import {
  characters,
  characterFeats,
  characterPowers,
  characterSkills,
  characterGear,
  characterComplications,
} from '@shared/schema';
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
    
    let query: any = db.select().from(characters);
    
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

    const [character] = await db
      .select()
      .from(characters)
      .where(eq(characters.id, id));

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const feats = await db
      .select()
      .from(characterFeats)
      .where(eq(characterFeats.characterId, id));

    const powers = await db
      .select()
      .from(characterPowers)
      .where(eq(characterPowers.characterId, id));

    const skillSets = await db
      .select()
      .from(characterSkills)
      .where(eq(characterSkills.characterId, id));

    const gearItems = await db
      .select()
      .from(characterGear)
      .where(eq(characterGear.characterId, id));

    const complications = await db
      .select()
      .from(characterComplications)
      .where(eq(characterComplications.characterId, id));

    res.json({
      ...character,
      data: {
        ...(character.data as any),
        feats,
        powers,
        skillSets,
        gear: gearItems,
        complications,
      },
    });
  } catch (error) {
    console.error('Error getting character:', error);
    res.status(500).json({ error: 'Failed to retrieve character' });
  }
};

// Create a new character
import { insertCharacterSchema } from "@shared/schema";

export const createCharacter = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      name,
      data,
      feats = [],
      powers = [],
      skillSets = [],
      gear = [],
      complications = [],
    } = req.body;

    const parsed = insertCharacterSchema.parse({ userId, name, data });

    const [character] = await db
      .insert(characters)
      .values({
        userId: Number(parsed.userId),
        name: parsed.name,
        data: parsed.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const characterId = character.id;

    if (feats.length) {
      await db.insert(characterFeats).values(
        feats.map((f: any) => ({
          characterId,
          featId: f.id ?? null,
          name: f.name,
          source: f.source ?? null,
          skillSetName: f.skillSetName ?? null,
        }))
      );
    }

    if (powers.length) {
      await db.insert(characterPowers).values(
        powers.map((p: any) => ({
          characterId,
          powerId: p.id ?? null,
          name: p.name,
          description: p.description ?? null,
          cost: p.cost ?? null,
          rank: p.rank ?? null,
          perks: p.perks ?? [],
          flaws: p.flaws ?? [],
        }))
      );
    }

    if (skillSets.length) {
      await db.insert(characterSkills).values(
        skillSets.map((s: any) => ({
          characterId,
          skillSetId: s.id ?? null,
          name: s.name,
          ability: s.ability,
          ranks: s.ranks,
          specialization: s.specialization ?? null,
          trained: s.trained,
        }))
      );
    }

    if (gear.length) {
      await db.insert(characterGear).values(
        gear.map((g: any) => ({
          characterId,
          gearId: g.id ?? null,
          name: g.name,
          description: g.description ?? null,
        }))
      );
    }

    if (complications.length) {
      await db.insert(characterComplications).values(
        complications.map((c: any) => ({
          characterId,
          name: c.name,
          description: c.description,
        }))
      );
    }

    res.status(201).json({ id: characterId });
  } catch (error: any) {
    console.error('Error creating character:', error);
    res.status(400).json({
      error: 'Failed to create character',
      detail: error?.message ?? error
    });
  }
};

// Update an existing character
export const updateCharacter = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, data, feats = [], powers = [], skillSets = [], gear = [], complications = [] } = req.body;
    
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
    
    const [updatedCharacter] = await db
      .update(characters)
      .set({
        name: name || existingCharacter.name,
        data: data || existingCharacter.data,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, id))
      .returning();

    // Replace related data
    await Promise.all([
      db.delete(characterFeats).where(eq(characterFeats.characterId, id)),
      db.delete(characterPowers).where(eq(characterPowers.characterId, id)),
      db.delete(characterSkills).where(eq(characterSkills.characterId, id)),
      db.delete(characterGear).where(eq(characterGear.characterId, id)),
      db.delete(characterComplications).where(eq(characterComplications.characterId, id)),
    ]);

    if (feats.length) {
      await db.insert(characterFeats).values(
        feats.map((f: any) => ({
          characterId: id,
          featId: f.id ?? null,
          name: f.name,
          source: f.source ?? null,
          skillSetName: f.skillSetName ?? null,
        }))
      );
    }

    if (powers.length) {
      await db.insert(characterPowers).values(
        powers.map((p: any) => ({
          characterId: id,
          powerId: p.id ?? null,
          name: p.name,
          description: p.description ?? null,
          cost: p.cost ?? null,
          rank: p.rank ?? null,
          perks: p.perks ?? [],
          flaws: p.flaws ?? [],
        }))
      );
    }

    if (skillSets.length) {
      await db.insert(characterSkills).values(
        skillSets.map((s: any) => ({
          characterId: id,
          skillSetId: s.id ?? null,
          name: s.name,
          ability: s.ability,
          ranks: s.ranks,
          specialization: s.specialization ?? null,
          trained: s.trained,
        }))
      );
    }

    if (gear.length) {
      await db.insert(characterGear).values(
        gear.map((g: any) => ({
          characterId: id,
          gearId: g.id ?? null,
          name: g.name,
          description: g.description ?? null,
        }))
      );
    }

    if (complications.length) {
      await db.insert(characterComplications).values(
        complications.map((c: any) => ({
          characterId: id,
          name: c.name,
          description: c.description,
        }))
      );
    }
    
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