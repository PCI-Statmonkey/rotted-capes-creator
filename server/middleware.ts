import { Request, Response, NextFunction } from 'express';
import { getAuth } from './firebaseAdmin';

export async function authenticateFirebaseToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing Authorization token' });
  }
  const idToken = authHeader.split(' ')[1];
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed', err);
    res.status(401).json({ message: 'Invalid token' });
  }
}
