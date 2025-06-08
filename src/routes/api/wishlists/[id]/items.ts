import type { APIEvent } from '@solidjs/start/server';
import { db } from '~/lib/db';

export async function POST(event: APIEvent) {
  try {
    const id = event.params.id;
    const body = await event.request.json();
    const { dressId } = body;

    if (!dressId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'dressId is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if wishlist exists
    const wishlist = await db.wishlist.findUnique({
      where: { id }
    });

    if (!wishlist) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Wishlist not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if dress exists
    const dress = await db.dress.findUnique({
      where: { id: dressId }
    });

    if (!dress) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Dress not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if item already exists in wishlist
    const existingItem = await db.wishlistItem.findFirst({
      where: {
        wishlistId: id,
        dressId: dressId
      }
    });

    if (existingItem) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Dress already in wishlist'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add item to wishlist
    const wishlistItem = await db.wishlistItem.create({
    data: {
      wishlistId: id,
      dressId: dressId
    },
    include: {
      dress: true
    }
    });

    console.log('✅ DATABASE: Successfully created wishlist item:', {
      wishlistId: id,
      dressId: dressId,
      itemId: wishlistItem.id
    });

    // In your DELETE method, add this logging:
    await db.wishlistItem.delete({
      where: { id: wishlistItem.id }
    });

    console.log('✅ DATABASE: Successfully deleted wishlist item:', {
      wishlistId: id,
      dressId: dressId,
      itemId: wishlistItem.id
    });

    return new Response(JSON.stringify({
      success: true,
      data: wishlistItem
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error adding item to wishlist:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to add item to wishlist'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(event: APIEvent) {
  try {
    const id = event.params.id;
    const url = new URL(event.request.url);
    const dressId = url.searchParams.get('dressId');

    if (!dressId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'dressId query parameter is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find and delete the wishlist item
    const wishlistItem = await db.wishlistItem.findFirst({
      where: {
        wishlistId: id,
        dressId: dressId
      }
    });

    if (!wishlistItem) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Dress not found in wishlist'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await db.wishlistItem.delete({
      where: { id: wishlistItem.id }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Dress removed from wishlist'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error removing dress from wishlist:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to remove dress from wishlist'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}