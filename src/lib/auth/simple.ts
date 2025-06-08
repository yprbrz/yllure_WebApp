import { action } from '@solidjs/router';
import { redirect } from '@solidjs/router';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getSession } from './session';
import { db } from '../db';

export const userSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const register = action(async (formData: FormData) => {
  'use server';
  
  try {
    const data = userSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
    });

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('A user with this email already exists');
    }

    // Hash password properly
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        password: hashedPassword,
        admin: false,
      }
    });

    // Create session
    const session = await getSession();
    await session.update({ email: user.email });

    throw redirect('/');
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors.map(e => e.message).join(', '));
    }
    
    throw error;
  }
}, 'register');

export const login = action(async (formData: FormData) => {
  'use server';
  
  try {
    const data = loginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Create session
    const session = await getSession();
    await session.update({ email: user.email });

    throw redirect('/');
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors.map(e => e.message).join(', '));
    }
    
    throw error;
  }
}, 'login');