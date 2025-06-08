import { query, action } from '@solidjs/router';
import { redirect } from '@solidjs/router';
import { getSession } from './session';
import { db } from '../db';

export const getUser = query(async () => {
  'use server';
  try {
    const session = await getSession();
    if (!session.data.email) {
      return null;
    }
    return await db.user.findUniqueOrThrow({
      where: { email: session.data.email },
    });
  } catch {
    return null;
  }
}, 'getUser');

export const logout = action(async () => {
  'use server';
  const session = await getSession();
  await session.clear();
  throw redirect('/'); // Changed from reload() to redirect('/')
}, 'logout');