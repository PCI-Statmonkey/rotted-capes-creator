import { 
  users, characters, analytics, origins, archetypes, skills, feats, skillSets, powers, powerSets, powerModifiers,
  type User, type InsertUser, type Character, type InsertCharacter, type InsertAnalytics, type Analytics,
  type Origin, type InsertOrigin, type Archetype, type InsertArchetype, type Skill, type InsertSkill,
  type Feat, type InsertFeat, type SkillSet, type InsertSkillSet, type Power, type InsertPower,
  type PowerSet, type InsertPowerSet, type PowerModifier, type InsertPowerModifier
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Character methods
  getCharactersByUserId(userId: string): Promise<any[]>;
  getCharacterById(id: string): Promise<any>;
  createCharacter(data: any): Promise<any>;
  updateCharacter(id: string, data: any): Promise<any>;
  deleteCharacter(id: string): Promise<void>;
  
  // Analytics methods
  recordAnalyticsEvent(event: string, data: any, userId?: string): Promise<any>;
  getAnalyticsSummary(): Promise<any>;
  
  // Game content methods - Origins
  getAllOrigins(): Promise<Origin[]>;
  getOriginById(id: number): Promise<Origin | undefined>;
  createOrigin(data: InsertOrigin): Promise<Origin>;
  updateOrigin(id: number, data: Partial<InsertOrigin>): Promise<Origin | undefined>;
  deleteOrigin(id: number): Promise<void>;
  
  // Game content methods - Archetypes
  getAllArchetypes(): Promise<Archetype[]>;
  getArchetypeById(id: number): Promise<Archetype | undefined>;
  createArchetype(data: InsertArchetype): Promise<Archetype>;
  updateArchetype(id: number, data: Partial<InsertArchetype>): Promise<Archetype | undefined>;
  deleteArchetype(id: number): Promise<void>;
  
  // Game content methods - Skills
  getAllSkills(): Promise<Skill[]>;
  getSkillById(id: number): Promise<Skill | undefined>;
  createSkill(data: InsertSkill): Promise<Skill>;
  updateSkill(id: number, data: Partial<InsertSkill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<void>;
  
  // Game content methods - Feats
  getAllFeats(): Promise<Feat[]>;
  getFeatById(id: number): Promise<Feat | undefined>;
  createFeat(data: InsertFeat): Promise<Feat>;
  updateFeat(id: number, data: Partial<InsertFeat>): Promise<Feat | undefined>;
  deleteFeat(id: number): Promise<void>;
  
  // Game content methods - Skill Sets
  getAllSkillSets(): Promise<SkillSet[]>;
  getSkillSetById(id: number): Promise<SkillSet | undefined>;
  createSkillSet(data: InsertSkillSet): Promise<SkillSet>;
  updateSkillSet(id: number, data: Partial<InsertSkillSet>): Promise<SkillSet | undefined>;
  deleteSkillSet(id: number): Promise<void>;
  
  // Game content methods - Powers
  getAllPowers(): Promise<Power[]>;
  getPowerById(id: number): Promise<Power | undefined>;
  createPower(data: InsertPower): Promise<Power>;
  updatePower(id: number, data: Partial<InsertPower>): Promise<Power | undefined>;
  deletePower(id: number): Promise<void>;
  
  // Game content methods - Power Sets
  getAllPowerSets(): Promise<PowerSet[]>;
  getPowerSetById(id: number): Promise<PowerSet | undefined>;
  createPowerSet(data: InsertPowerSet): Promise<PowerSet>;
  updatePowerSet(id: number, data: Partial<InsertPowerSet>): Promise<PowerSet | undefined>;
  deletePowerSet(id: number): Promise<void>;
  
  // Game content methods - Power Modifiers
  getAllPowerModifiers(): Promise<PowerModifier[]>;
  getPowerModifierById(id: number): Promise<PowerModifier | undefined>;
  createPowerModifier(data: InsertPowerModifier): Promise<PowerModifier>;
  updatePowerModifier(id: number, data: Partial<InsertPowerModifier>): Promise<PowerModifier | undefined>;
  deletePowerModifier(id: number): Promise<void>;
}

// DATABASE STORAGE IMPLEMENTATION
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Character methods
  async getCharactersByUserId(userId: string): Promise<any[]> {
    const result = await db.select()
      .from(characters)
      .where(eq(characters.userId, Number(userId)))
      .orderBy(desc(characters.updatedAt));
    
    return result;
  }
  
  async getCharacterById(id: string): Promise<any> {
    const [character] = await db.select()
      .from(characters)
      .where(eq(characters.id, Number(id)));
    
    return character;
  }
  
  async createCharacter(data: any): Promise<any> {
    const { userId, ...characterData } = data;
    
    const [character] = await db.insert(characters)
      .values({
        userId: Number(userId),
        name: characterData.name || 'Unnamed Character',
        data: characterData
      })
      .returning();
    
    return character;
  }
  
  async updateCharacter(id: string, data: any): Promise<any> {
    const [character] = await db.update(characters)
      .set({
        name: data.name || 'Unnamed Character',
        data: data,
        updatedAt: new Date()
      })
      .where(eq(characters.id, Number(id)))
      .returning();
    
    return character;
  }
  
  async deleteCharacter(id: string): Promise<void> {
    await db.delete(characters)
      .where(eq(characters.id, Number(id)));
  }
  
  // Analytics methods
  async recordAnalyticsEvent(event: string, data: any, userId?: string): Promise<any> {
    const [record] = await db.insert(analytics)
      .values({
        event,
        data,
        userId: userId ? Number(userId) : null
      })
      .returning();
    
    return record;
  }
  
  async getAnalyticsSummary(): Promise<any> {
    const allEvents = await db.select()
      .from(analytics)
      .orderBy(desc(analytics.createdAt));
    
    // Process the events to generate summary data
    // This is a simplified version - in production, you'd use more complex queries
    const characterEvents = allEvents.filter(event => 
      event.event.includes('character')
    );
    
    const userCount = new Set(
      allEvents.filter(event => event.userId !== null)
        .map(event => event.userId)
    ).size;
    
    return {
      events: allEvents.slice(0, 10),
      characterCount: characterEvents.length,
      userCount
    };
  }
}

// IN-MEMORY STORAGE IMPLEMENTATION (BACKUP)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characters: Map<string, any>;
  private analyticsEvents: any[];
  private currentUserId: number;
  private currentCharacterId: number;
  
  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.analyticsEvents = [];
    this.currentUserId = 1;
    this.currentCharacterId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Character methods
  async getCharactersByUserId(userId: string): Promise<any[]> {
    return Array.from(this.characters.values())
      .filter(char => char.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
  
  async getCharacterById(id: string): Promise<any> {
    return this.characters.get(id);
  }
  
  async createCharacter(data: any): Promise<any> {
    const id = String(this.currentCharacterId++);
    const character = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.characters.set(id, character);
    return character;
  }
  
  async updateCharacter(id: string, data: any): Promise<any> {
    const character = this.characters.get(id);
    if (!character) return null;
    
    const updatedCharacter = {
      ...character,
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }
  
  async deleteCharacter(id: string): Promise<void> {
    this.characters.delete(id);
  }
  
  // Analytics methods
  async recordAnalyticsEvent(event: string, data: any, userId?: string): Promise<any> {
    const analyticsEvent = {
      id: this.analyticsEvents.length + 1,
      event,
      data,
      userId,
      createdAt: new Date().toISOString()
    };
    
    this.analyticsEvents.push(analyticsEvent);
    return analyticsEvent;
  }
  
  async getAnalyticsSummary(): Promise<any> {
    return {
      events: this.analyticsEvents.slice(0, 10),
      characterCount: this.analyticsEvents.filter(e => e.event.includes('character')).length,
      userCount: new Set(this.analyticsEvents.filter(e => e.userId).map(e => e.userId)).size
    };
  }
}

// Use DatabaseStorage for production, fallback to MemStorage if needed
export const storage = new DatabaseStorage();
