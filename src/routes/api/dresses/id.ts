import type { APIEvent } from '@solidjs/start/server';
import { db } from '~/lib/db';

export async function GET(event: APIEvent) {
  try {
    const id = event.params.id;

    const dress = await db.dress.findUnique({
      where: { id },
      include: {
        _count: {
          select: { wishlistItems: true }
        }
      }
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

    return new Response(JSON.stringify({
      success: true,
      data: dress
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching dress:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch dress'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}