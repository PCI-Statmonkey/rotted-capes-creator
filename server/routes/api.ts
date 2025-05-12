import { Router } from 'express';
import * as characterController from '../controllers/characterController';
import * as analyticsController from '../controllers/analyticsController';

const router = Router();

// Character routes
router.get('/characters', characterController.getCharacters);
router.get('/characters/:id', characterController.getCharacter);
router.post('/characters', characterController.createCharacter);
router.put('/characters/:id', characterController.updateCharacter);
router.delete('/characters/:id', characterController.deleteCharacter);

// Analytics routes
router.post('/analytics/events', analyticsController.recordEvent);
router.get('/analytics/events', analyticsController.getEvents);
router.get('/analytics/summary', analyticsController.getAnalyticsSummary);

export default router;