import { NextResponse } from 'next/server';

const XI_API_KEY = process.env.XI_API_KEY;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ conversation_id: string }> }
) {
    if (!XI_API_KEY) {
        return NextResponse.json({ error: 'XI_API_KEY is not configured' }, { status: 500 });
    }

    const { conversation_id } = await params;

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversation_id}/audio`, {
            headers: {
                'xi-api-key': XI_API_KEY,
            },
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch audio' }, { status: response.status });
        }

        // We get a blob/stream. We should forward it.
        const audioBlob = await response.blob();
        const contentType = response.headers.get('Content-Type') || 'audio/mpeg';

        // Return with correct content type
        return new NextResponse(audioBlob, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });

    } catch (error) {
        console.error('Error fetching audio:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
