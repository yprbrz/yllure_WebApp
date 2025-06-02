import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../../lib/db.ts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = userSchema.parse(req.body);
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    
    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(400).json({ error: 'Email already exists' });
    }
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = userSchema.parse(req.body);
    
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(400).json({ error: 'Invalid credentials' });
    }
  }
});

export { router as authRouter };