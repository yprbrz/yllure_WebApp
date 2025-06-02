import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../lib/db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await db.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      throw new Error();
    }

    req.user = { id: user.id };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};