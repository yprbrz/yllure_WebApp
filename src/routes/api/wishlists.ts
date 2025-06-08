import type { APIEvent } from '@solidjs/start/server';
import { db } from '~/lib/db';
import { getSession } from '~/lib/auth/session';

export async function POST(event: APIEvent) {
  try {
    // Check if user is authenticated
    const session = await getSession();
    if (!session?.data?.email) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the user
    const user = await db.user.findUnique({
      where: { email: session.data.email }
    });

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user already has a wishlist
    const existingWishlist = await db.wishlist.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            dress: true
          }
        }
      }
    });

    if (existingWishlist) {
      return new Response(JSON.stringify({
        success: true,
        data: existingWishlist
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create new wishlist for user
    const body = await event.request.json();
    const { name } = body;

    const wishlist = await db.wishlist.create({
      data: {
        name: name || 'My Wishlist',
        userId: user.id
      },
      include: {
        items: {
          include: {
            dress: true
          }
        }
      }
    });

    return new Response(JSON.stringify({
      success: true,
      data: wishlist
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating wishlist:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create wishlist'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}