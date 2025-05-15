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

  // Game content methods - Origins
  async getAllOrigins(): Promise<Origin[]> {
    return await db.select().from(origins).orderBy(origins.name);
  }
  
  async getOriginById(id: number): Promise<Origin | undefined> {
    const [origin] = await db.select().from(origins).where(eq(origins.id, id));
    return origin;
  }
  
  async createOrigin(data: InsertOrigin): Promise<Origin> {
    const [origin] = await db.insert(origins)
      .values({
        ...data,
        updatedAt: new Date()
      })
      .returning();
    return origin;
  }
  
  async updateOrigin(id: number, data: Partial<InsertOrigin>): Promise<Origin | undefined> {
    const [origin] = await db.update(origins)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(origins.id, id))
      .returning();
    return origin;
  }
  
  async deleteOrigin(id: number): Promise<void> {
    await db.delete(origins).where(eq(origins.id, id));
  }
  
  // Game content methods - Archetypes
  async getAllArchetypes(): Promise<Archetype[]> {
    return await db.select().from(archetypes).orderBy(archetypes.name);
  }
  
  async getArchetypeById(id: number): Promise<Archetype | undefined> {
    const [archetype] = await db.select().from(archetypes).where(eq(archetypes.id, id));
    return archetype;
  }
  
  async createArchetype(data: InsertArchetype): Promise<Archetype> {
    const [archetype] = await db.insert(archetypes)
      .values({
        ...data,
        updatedAt: new Date()
      })
      .returning();
    return archetype;
  }
  
  async updateArchetype(id: number, data: Partial<InsertArchetype>): Promise<Archetype | undefined> {
    const [archetype] = await db.update(archetypes)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(archetypes.id, id))
      .returning();
    return archetype;
  }
  
  async deleteArchetype(id: number): Promise<void> {
    await db.delete(archetypes).where(eq(archetypes.id, id));
  }
  
  // Game content methods - Skills
  async getAllSkills(): Promise<Skill[]> {
    return await db.select().from(skills).orderBy(skills.name);
  }
  
  async getSkillById(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill;
  }
  
  async createSkill(data: InsertSkill): Promise<Skill> {
    const [skill] = await db.insert(skills)
      .values({
        ...data,
        updatedAt: new Date()
      })
      .returning();
    return skill;
  }
  
  async updateSkill(id: number, data: Partial<InsertSkill>): Promise<Skill | undefined> {
    const [skill] = await db.update(skills)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(skills.id, id))
      .returning();
    return skill;
  }
  
  async deleteSkill(id: number): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id));
  }
  
  // Game content methods - Feats
  async getAllFeats(): Promise<Feat[]> {
    return await db.select().from(feats).orderBy(feats.name);
  }
  
  async getFeatById(id: number): Promise<Feat | undefined> {
    const [feat] = await db.select().from(feats).where(eq(feats.id, id));
    return feat;
  }
  
  async createFeat(data: InsertFeat): Promise<Feat> {
    const [feat] = await db.insert(feats)
      .values({
        ...data,
        updatedAt: new Date()
      })
      .returning();
    return feat;
  }
  
  async updateFeat(id: number, data: Partial<InsertFeat>): Promise<Feat | undefined> {
    const [feat] = await db.update(feats)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(feats.id, id))
      .returning();
    return feat;
  }
  
  async deleteFeat(id: number): Promise<void> {
    await db.delete(feats).where(eq(feats.id, id));
  }
  
  // Game content methods - Skill Sets
  async getAllSkillSets(): Promise<SkillSet[]> {
    return await db.select().from(skillSets).orderBy(skillSets.name);
  }
  
  async getSkillSetById(id: number): Promise<SkillSet | undefined> {
    const [skillSet] = await db.select().from(skillSets).where(eq(skillSets.id, id));
    return skillSet;
  }
  
  async createSkillSet(data: InsertSkillSet): Promise<SkillSet> {
    const [skillSet] = await db.insert(skillSets)
      .values({
        ...data,
        updatedAt: new Date()
      })
      .returning();
    return skillSet;
  }
  
  async updateSkillSet(id: number, data: Partial<InsertSkillSet>): Promise<SkillSet | undefined> {
    const [skillSet] = await db.update(skillSets)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(skillSets.id, id))
      .returning();
    return skillSet;
  }
  
  async deleteSkillSet(id: number): Promise<void> {
    await db.delete(skillSets).where(eq(skillSets.id, id));
  }
  
  // Game content methods - Powers
  async getAllPowers(): Promise<Power[]> {
    return await db.select().from(powers).orderBy(powers.name);
  }
  
  async getPowerById(id: number): Promise<Power | undefined> {
    const [power] = await db.select().from(powers).where(eq(powers.id, id));
    return power;
  }
  
  async createPower(data: InsertPower): Promise<Power> {
    const [power] = await db.insert(powers)
      .values({
        ...data,
        updatedAt: new Date()
      })
      .returning();
    return power;
  }
  
  async updatePower(id: number, data: Partial<InsertPower>): Promise<Power | undefined> {
    const [power] = await db.update(powers)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(powers.id, id))
      .returning();
    return power;
  }
  
  async deletePower(id: number): Promise<void> {
    await db.delete(powers).where(eq(powers.id, id));
  }
  
  // Game content methods - Power Sets
  async getAllPowerSets(): Promise<PowerSet[]> {
    return await db.select().from(powerSets).orderBy(powerSets.name);
  }
  
  async getPowerSetById(id: number): Promise<PowerSet | undefined> {
    const [powerSet] = await db.select().from(powerSets).where(eq(powerSets.id, id));
    return powerSet;
  }
  
  async createPowerSet(data: InsertPowerSet): Promise<PowerSet> {
    const [powerSet] = await db.insert(powerSets)
      .values({
        ...data,
        updatedAt: new Date()
      })
      .returning();
    return powerSet;
  }
  
  async updatePowerSet(id: number, data: Partial<InsertPowerSet>): Promise<PowerSet | undefined> {
    const [powerSet] = await db.update(powerSets)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(powerSets.id, id))
      .returning();
    return powerSet;
  }
  
  async deletePowerSet(id: number): Promise<void> {
    await db.delete(powerSets).where(eq(powerSets.id, id));
  }
  
  // Game content methods - Power Modifiers
  async getAllPowerModifiers(): Promise<PowerModifier[]> {
    return await db.select().from(powerModifiers).orderBy(powerModifiers.name);
  }
  
  async getPowerModifierById(id: number): Promise<PowerModifier | undefined> {
    const [powerModifier] = await db.select().from(powerModifiers).where(eq(powerModifiers.id, id));
    return powerModifier;
  }
  
  async createPowerModifier(data: InsertPowerModifier): Promise<PowerModifier> {
    const [powerModifier] = await db.insert(powerModifiers)
      .values({
        ...data,
        updatedAt: new Date()
      })
      .returning();
    return powerModifier;
  }
  
  async updatePowerModifier(id: number, data: Partial<InsertPowerModifier>): Promise<PowerModifier | undefined> {
    const [powerModifier] = await db.update(powerModifiers)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(powerModifiers.id, id))
      .returning();
    return powerModifier;
  }
  
  async deletePowerModifier(id: number): Promise<void> {
    await db.delete(powerModifiers).where(eq(powerModifiers.id, id));
  }
}

// IN-MEMORY STORAGE IMPLEMENTATION (BACKUP)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characters: Map<string, any>;
  private analyticsEvents: any[];
  private origins: Map<number, Origin>;
  private archetypes: Map<number, Archetype>;
  private skillsList: Map<number, Skill>;
  private featsList: Map<number, Feat>;
  private skillSetsList: Map<number, SkillSet>;
  private powersList: Map<number, Power>;
  private powerSetsList: Map<number, PowerSet>;
  private powerModifiersList: Map<number, PowerModifier>;
  
  private currentUserId: number;
  private currentCharacterId: number;
  private currentOriginId: number;
  private currentArchetypeId: number;
  private currentSkillId: number;
  private currentFeatId: number;
  private currentSkillSetId: number;
  private currentPowerId: number;
  private currentPowerSetId: number;
  private currentPowerModifierId: number;
  
  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.analyticsEvents = [];
    this.origins = new Map();
    this.archetypes = new Map();
    this.skillsList = new Map();
    this.featsList = new Map();
    this.skillSetsList = new Map();
    this.powersList = new Map();
    this.powerSetsList = new Map();
    this.powerModifiersList = new Map();
    
    this.currentUserId = 1;
    this.currentCharacterId = 1;
    this.currentOriginId = 1;
    this.currentArchetypeId = 1;
    this.currentSkillId = 1;
    this.currentFeatId = 1;
    this.currentSkillSetId = 1;
    this.currentPowerId = 1;
    this.currentPowerSetId = 1;
    this.currentPowerModifierId = 1;
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
  
  // Game content methods - Origins
  async getAllOrigins(): Promise<Origin[]> {
    return Array.from(this.origins.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
  
  async getOriginById(id: number): Promise<Origin | undefined> {
    return this.origins.get(id);
  }
  
  async createOrigin(data: InsertOrigin): Promise<Origin> {
    const id = this.currentOriginId++;
    const now = new Date();
    const origin: Origin = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.origins.set(id, origin);
    return origin;
  }
  
  async updateOrigin(id: number, data: Partial<InsertOrigin>): Promise<Origin | undefined> {
    const origin = this.origins.get(id);
    if (!origin) return undefined;
    
    const updatedOrigin: Origin = {
      ...origin,
      ...data,
      updatedAt: new Date()
    };
    
    this.origins.set(id, updatedOrigin);
    return updatedOrigin;
  }
  
  async deleteOrigin(id: number): Promise<void> {
    this.origins.delete(id);
  }
  
  // Game content methods - Archetypes
  async getAllArchetypes(): Promise<Archetype[]> {
    return Array.from(this.archetypes.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
  
  async getArchetypeById(id: number): Promise<Archetype | undefined> {
    return this.archetypes.get(id);
  }
  
  async createArchetype(data: InsertArchetype): Promise<Archetype> {
    const id = this.currentArchetypeId++;
    const now = new Date();
    const archetype: Archetype = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.archetypes.set(id, archetype);
    return archetype;
  }
  
  async updateArchetype(id: number, data: Partial<InsertArchetype>): Promise<Archetype | undefined> {
    const archetype = this.archetypes.get(id);
    if (!archetype) return undefined;
    
    const updatedArchetype: Archetype = {
      ...archetype,
      ...data,
      updatedAt: new Date()
    };
    
    this.archetypes.set(id, updatedArchetype);
    return updatedArchetype;
  }
  
  async deleteArchetype(id: number): Promise<void> {
    this.archetypes.delete(id);
  }
  
  // Game content methods - Skills
  async getAllSkills(): Promise<Skill[]> {
    return Array.from(this.skillsList.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
  
  async getSkillById(id: number): Promise<Skill | undefined> {
    return this.skillsList.get(id);
  }
  
  async createSkill(data: InsertSkill): Promise<Skill> {
    const id = this.currentSkillId++;
    const now = new Date();
    const skill: Skill = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.skillsList.set(id, skill);
    return skill;
  }
  
  async updateSkill(id: number, data: Partial<InsertSkill>): Promise<Skill | undefined> {
    const skill = this.skillsList.get(id);
    if (!skill) return undefined;
    
    const updatedSkill: Skill = {
      ...skill,
      ...data,
      updatedAt: new Date()
    };
    
    this.skillsList.set(id, updatedSkill);
    return updatedSkill;
  }
  
  async deleteSkill(id: number): Promise<void> {
    this.skillsList.delete(id);
  }
  
  // Game content methods - Feats
  async getAllFeats(): Promise<Feat[]> {
    return Array.from(this.featsList.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
  
  async getFeatById(id: number): Promise<Feat | undefined> {
    return this.featsList.get(id);
  }
  
  async createFeat(data: InsertFeat): Promise<Feat> {
    const id = this.currentFeatId++;
    const now = new Date();
    const feat: Feat = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.featsList.set(id, feat);
    return feat;
  }
  
  async updateFeat(id: number, data: Partial<InsertFeat>): Promise<Feat | undefined> {
    const feat = this.featsList.get(id);
    if (!feat) return undefined;
    
    const updatedFeat: Feat = {
      ...feat,
      ...data,
      updatedAt: new Date()
    };
    
    this.featsList.set(id, updatedFeat);
    return updatedFeat;
  }
  
  async deleteFeat(id: number): Promise<void> {
    this.featsList.delete(id);
  }
  
  // Game content methods - Skill Sets
  async getAllSkillSets(): Promise<SkillSet[]> {
    return Array.from(this.skillSetsList.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
  
  async getSkillSetById(id: number): Promise<SkillSet | undefined> {
    return this.skillSetsList.get(id);
  }
  
  async createSkillSet(data: InsertSkillSet): Promise<SkillSet> {
    const id = this.currentSkillSetId++;
    const now = new Date();
    const skillSet: SkillSet = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.skillSetsList.set(id, skillSet);
    return skillSet;
  }
  
  async updateSkillSet(id: number, data: Partial<InsertSkillSet>): Promise<SkillSet | undefined> {
    const skillSet = this.skillSetsList.get(id);
    if (!skillSet) return undefined;
    
    const updatedSkillSet: SkillSet = {
      ...skillSet,
      ...data,
      updatedAt: new Date()
    };
    
    this.skillSetsList.set(id, updatedSkillSet);
    return updatedSkillSet;
  }
  
  async deleteSkillSet(id: number): Promise<void> {
    this.skillSetsList.delete(id);
  }
  
  // Game content methods - Powers
  async getAllPowers(): Promise<Power[]> {
    return Array.from(this.powersList.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
  
  async getPowerById(id: number): Promise<Power | undefined> {
    return this.powersList.get(id);
  }
  
  async createPower(data: InsertPower): Promise<Power> {
    const id = this.currentPowerId++;
    const now = new Date();
    const power: Power = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.powersList.set(id, power);
    return power;
  }
  
  async updatePower(id: number, data: Partial<InsertPower>): Promise<Power | undefined> {
    const power = this.powersList.get(id);
    if (!power) return undefined;
    
    const updatedPower: Power = {
      ...power,
      ...data,
      updatedAt: new Date()
    };
    
    this.powersList.set(id, updatedPower);
    return updatedPower;
  }
  
  async deletePower(id: number): Promise<void> {
    this.powersList.delete(id);
  }
  
  // Game content methods - Power Sets
  async getAllPowerSets(): Promise<PowerSet[]> {
    return Array.from(this.powerSetsList.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
  
  async getPowerSetById(id: number): Promise<PowerSet | undefined> {
    return this.powerSetsList.get(id);
  }
  
  async createPowerSet(data: InsertPowerSet): Promise<PowerSet> {
    const id = this.currentPowerSetId++;
    const now = new Date();
    const powerSet: PowerSet = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.powerSetsList.set(id, powerSet);
    return powerSet;
  }
  
  async updatePowerSet(id: number, data: Partial<InsertPowerSet>): Promise<PowerSet | undefined> {
    const powerSet = this.powerSetsList.get(id);
    if (!powerSet) return undefined;
    
    const updatedPowerSet: PowerSet = {
      ...powerSet,
      ...data,
      updatedAt: new Date()
    };
    
    this.powerSetsList.set(id, updatedPowerSet);
    return updatedPowerSet;
  }
  
  async deletePowerSet(id: number): Promise<void> {
    this.powerSetsList.delete(id);
  }
  
  // Game content methods - Power Modifiers
  async getAllPowerModifiers(): Promise<PowerModifier[]> {
    return Array.from(this.powerModifiersList.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
  
  async getPowerModifierById(id: number): Promise<PowerModifier | undefined> {
    return this.powerModifiersList.get(id);
  }
  
  async createPowerModifier(data: InsertPowerModifier): Promise<PowerModifier> {
    const id = this.currentPowerModifierId++;
    const now = new Date();
    const powerModifier: PowerModifier = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.powerModifiersList.set(id, powerModifier);
    return powerModifier;
  }
  
  async updatePowerModifier(id: number, data: Partial<InsertPowerModifier>): Promise<PowerModifier | undefined> {
    const powerModifier = this.powerModifiersList.get(id);
    if (!powerModifier) return undefined;
    
    const updatedPowerModifier: PowerModifier = {
      ...powerModifier,
      ...data,
      updatedAt: new Date()
    };
    
    this.powerModifiersList.set(id, updatedPowerModifier);
    return updatedPowerModifier;
  }
  
  async deletePowerModifier(id: number): Promise<void> {
    this.powerModifiersList.delete(id);
  }
}

// Use DatabaseStorage for production, fallback to MemStorage if needed
export const storage = new DatabaseStorage();
