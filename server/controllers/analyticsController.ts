import { Request, Response } from 'express';
import { db } from '../db';
import { analytics } from '@shared/schema';
import { desc, eq, sql } from 'drizzle-orm';

/**
 * Controller for analytics-related database operations
 * Tracks user activity and character creation patterns
 */

// Record a new analytics event
export const recordEvent = async (req: Request, res: Response) => {
  try {
    const { event, data, userId } = req.body;
    
    if (!event) {
      return res.status(400).json({ error: 'Event name is required' });
    }
    
    const [result] = await db.insert(analytics)
      .values({
        event,
        data: data || {},
        userId: userId ? Number(userId) : null
      })
      .returning();
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error recording analytics event:', error);
    res.status(500).json({ error: 'Failed to record analytics event' });
  }
};

// Get all analytics events (paginated, with optional filtering)
export const getEvents = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 50,
      event,
      userId,
      startDate,
      endDate
    } = req.query;
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;
    
    // Build query with filters
    let query = db.select().from(analytics);
    
    if (event) {
      query = query.where(eq(analytics.event, String(event)));
    }
    
    if (userId) {
      query = query.where(eq(analytics.userId, Number(userId)));
    }
    
    if (startDate) {
      const start = new Date(String(startDate));
      query = query.where(
        sql`${analytics.createdAt} >= ${start}`
      );
    }
    
    if (endDate) {
      const end = new Date(String(endDate));
      query = query.where(
        sql`${analytics.createdAt} <= ${end}`
      );
    }
    
    // Add pagination and ordering
    query = query
      .orderBy(desc(analytics.createdAt))
      .limit(limitNum)
      .offset(offset);
    
    const results = await query;
    
    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(analytics);
    
    res.json({
      results,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Error retrieving analytics events:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics events' });
  }
};

// Get analytics summary for dashboard
export const getAnalyticsSummary = async (req: Request, res: Response) => {
  try {
    // Get most popular character origins
    const origins = await db
      .select({
        origin: sql<string>`data->>'origin'`,
        count: sql<number>`count(*)`.mapWith(Number)
      })
      .from(analytics)
      .where(sql`data->>'origin' is not null`)
      .groupBy(sql`data->>'origin'`)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(10);
    
    // Get most popular character archetypes
    const archetypes = await db
      .select({
        archetype: sql<string>`data->>'archetype'`,
        count: sql<number>`count(*)`.mapWith(Number)
      })
      .from(analytics)
      .where(sql`data->>'archetype' is not null`)
      .groupBy(sql`data->>'archetype'`)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(10);
    
    // Get user counts
    const [{ userCount }] = await db
      .select({
        userCount: sql<number>`count(distinct user_id)`.mapWith(Number)
      })
      .from(analytics)
      .where(sql`user_id is not null`);
    
    // Get total characters created
    const [{ characterCount }] = await db
      .select({
        characterCount: sql<number>`count(*)`.mapWith(Number)
      })
      .from(analytics)
      .where(eq(analytics.event, 'character_created'));
    
    // Recent events
    const recentEvents = await db
      .select()
      .from(analytics)
      .orderBy(desc(analytics.createdAt))
      .limit(10);
    
    res.json({
      origins,
      archetypes,
      userCount,
      characterCount,
      recentEvents
    });
  } catch (error) {
    console.error('Error retrieving analytics summary:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics summary' });
  }
};