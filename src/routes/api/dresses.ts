import type { APIEvent } from '@solidjs/start/server';
import { db } from '~/lib/db';

export async function GET(event: APIEvent) {
  try {
    const url = new URL(event.request.url);
    const size = url.searchParams.get('size');
    const available = url.searchParams.get('available');

    const where: any = {};

    // Filter by size if provided
    if (size) {
      where.size = size;
    }

    // Filter by availability if provided
    if (available !== null) {
      where.available = available === 'true';
    }

    const dresses = await db.dress.findMany({
      where,
      orderBy: [
        { available: 'desc' }, // Available dresses first
        { createdAt: 'desc' }  // Then by newest
      ]
    });

    return new Response(JSON.stringify({
      success: true,
      data: dresses,
      count: dresses.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching dresses:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch dresses'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}