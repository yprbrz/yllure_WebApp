import express from 'express';
import { z } from 'zod';
import { db } from '../../lib/db.ts';
import { auth } from '../middleware/auth.js';
import { Prisma } from '@prisma/client';

const router = express.Router();

const rentalSchema = z.object({
  dressId: z.number().int().positive(),
  color: z.string(),
  size: z.string(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  totalPrice: z.number().positive()
});

router.get('/', auth, async (req, res) => {
  try {
    const rentals = await db.rental.findMany({
      where: { userId: req.user!.id },
      include: { dress: true }
    });
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const rental = await db.rental.findUnique({
      where: { 
        id: req.params.id,
        userId: req.user!.id
      },
      include: { dress: true }
    });
    
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }
    
    res.json(rental);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const data = rentalSchema.parse(req.body);
    
    const rental = await db.rental.create({
      data: {
        ...data,
        userId: req.user!.id
      },
      include: { dress: true }
    });
    
    res.status(201).json(rental);
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
    const data = z.object({
      status: z.enum(['pending', 'confirmed', 'cancelled'])
    }).parse(req.body);
    
    const rental = await db.rental.update({
      where: { 
        id: req.params.id,
        userId: req.user!.id
      },
      data: { status: data.status },
      include: { dress: true }
    });
    
    res.json(rental);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ error: 'Rental not found' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

export { router as rentalRouter };