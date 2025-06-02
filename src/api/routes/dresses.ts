import express from 'express';
import { z } from 'zod';
import { db } from '../../lib/db.ts';
import { auth } from '../middleware/auth.ts';
import { Prisma } from '@prisma/client';

const router = express.Router();

const dressSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  images: z.array(z.string()),
  colors: z.array(z.string()),
  sizes: z.array(z.string()),
  featured: z.boolean().optional(),
  available: z.boolean().optional(),
  category: z.string()
});

router.get('/', async (req, res) => {
  try {
    const featured = req.query.featured === 'true';
    
    const dresses = await db.dress.findMany({
      where: featured ? { featured: true } : undefined
    });
    
    res.json(dresses);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const dress = await db.dress.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!dress) {
      return res.status(404).json({ error: 'Dress not found' });
    }
    
    res.json(dress);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const data = dressSchema.parse(req.body);
    
    const dress = await db.dress.create({
      data: {
        ...data,
        images: data.images as any,
        colors: data.colors as any,
        sizes: data.sizes as any
      }
    });
    
    res.status(201).json(dress);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const data = dressSchema.parse(req.body);
    
    const dress = await db.dress.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...data,
        images: data.images as any,
        colors: data.colors as any,
        sizes: data.sizes as any
      }
    });
    
    res.json(dress);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ error: 'Dress not found' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await db.dress.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ error: 'Dress not found' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

export { router as dressRouter };