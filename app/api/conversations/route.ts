import { NextResponse } from 'next/server';

const XI_API_KEY = process.env.XI_API_KEY;

export async function GET() {
  if (!XI_API_KEY) {
    return NextResponse.json({ error: 'XI_API_KEY is not configured' }, { status: 500 });
  }

  try {
    // 1. Fetch list of conversations
    const response = await fetch('https://api.elevenlabs.io/v1/convai/conversations', {
      headers: { 'xi-api-key': XI_API_KEY },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch list: ${response.statusText}`);
    }

    const { conversations } = await response.json();

    // 2. Fetch details for each conversation to get metadata (phone numbers)
    // Limit to first 20 to avoid rate limits/slow loading
    const recentConversations = conversations.slice(0, 20);

    const detailedConversations = await Promise.all(
      recentConversations.map(async (conv: any) => {
        try {
          const detailRes = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conv.conversation_id}`, {
            headers: { 'xi-api-key': XI_API_KEY },
          });

          if (!detailRes.ok) return conv; // Fallback to summary if detail fails

          const details = await detailRes.json();
          return { ...conv, metadata: details.metadata };
        } catch (e) {
          console.error(`Failed to fetch details for ${conv.conversation_id}`, e);
          return conv;
        }
      })
    );

    const res = NextResponse.json({ conversations: detailedConversations });
    res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

    return res;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
