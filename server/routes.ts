import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import gameContentRoutes from "./routes/gameContent";
import { authenticateFirebaseToken } from "./middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register game content routes
  app.use('/api/game-content', gameContentRoutes);

  // Protect API routes with Firebase auth
  app.use('/api/characters', authenticateFirebaseToken);
  app.use('/api/analytics', authenticateFirebaseToken);
  // Character data API routes
  app.get('/api/characters', async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const characters = await storage.getCharactersByUserId(parseInt(userId));
      res.json(characters);
    } catch (error) {
      console.error('Error fetching characters:', error);
      res.status(500).json({ message: 'Failed to retrieve characters' });
    }
  });

  app.get('/api/characters/:id', async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      const characterId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const character = await storage.getCharacterById(parseInt(characterId));
      
      if (!character) {
        return res.status(404).json({ message: 'Character not found' });
      }
      
      if (character.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to access this character' });
      }
      
      res.json(character);
    } catch (error) {
      console.error('Error fetching character:', error);
      res.status(500).json({ message: 'Failed to retrieve character' });
    }
  });

  app.post('/api/characters', async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const characterData = { ...req.body, userId: parseInt(userId) };
      const newCharacter = await storage.createCharacter(characterData);
      
      res.status(201).json(newCharacter);
    } catch (error) {
      console.error('Error creating character:', error);
      res.status(500).json({ message: 'Failed to create character' });
    }
  });

  app.put('/api/characters/:id', async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      const characterId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const character = await storage.getCharacterById(parseInt(characterId));
      
      if (!character) {
        return res.status(404).json({ message: 'Character not found' });
      }
      
      if (character.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this character' });
      }
      
      const updatedCharacter = await storage.updateCharacter(parseInt(characterId), req.body);
      res.json(updatedCharacter);
    } catch (error) {
      console.error('Error updating character:', error);
      res.status(500).json({ message: 'Failed to update character' });
    }
  });

  app.delete('/api/characters/:id', async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      const characterId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const character = await storage.getCharacterById(parseInt(characterId));
      
      if (!character) {
        return res.status(404).json({ message: 'Character not found' });
      }
      
      if (character.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to delete this character' });
      }
      
      await storage.deleteCharacter(parseInt(characterId));
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting character:', error);
      res.status(500).json({ message: 'Failed to delete character' });
    }
  });

  // Analytics endpoints
  app.get('/api/analytics/summary', async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Check if user is admin
      const user = await (storage as any).getUser(parseInt(userId));
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const analyticsSummary = await (storage as any).getAnalyticsSummary();
      res.json(analyticsSummary);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Failed to retrieve analytics data' });
    }
  });

  // User auth and profile endpoints
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userSchema = z.object({
        username: z.string().min(3).max(20),
        password: z.string().min(6),
        email: z.string().email()
      });
      
      const validatedData = userSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await (storage as any).getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      const newUser = await (storage as any).createUser({
        username: validatedData.username,
        password: validatedData.password, // In a real app, this would be hashed
        email: validatedData.email,
        isAdmin: false
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error registering user:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to register user' });
    }
  });

  // Auth routes are handled client-side via Firebase

  app.get('/api/user/profile', authenticateFirebaseToken, async (req, res) => {
    try {
      const decoded = (req as any).user;
      if (!decoded?.uid) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      res.json({ uid: decoded.uid, email: decoded.email });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Failed to retrieve user profile' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
