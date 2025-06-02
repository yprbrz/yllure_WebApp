import express from 'express';
import { z } from 'zod';
import { db } from '../../lib/db.ts';
import { auth } from '../middleware/auth.ts';

const router = express.Router();

const userUpdateSchema = z.object({
  name: z.string().optional()
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/me', auth, async (req, res) => {
  try {
    const data = userUpdateSchema.parse(req.body);
    
    const user = await db.user.update({
      where: { id: req.user!.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

export { router as userRouter };