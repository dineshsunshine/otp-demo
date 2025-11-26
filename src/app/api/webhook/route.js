import { NextResponse } from 'next/server';
import { updateStatusStore } from '@/lib/store';

// Verify Token - User needs to set this in Meta Dashboard
const VERIFY_TOKEN = 'my_secure_verify_token';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            return new NextResponse(challenge, { status: 200 });
        } else {
            return new NextResponse('Forbidden', { status: 403 });
        }
    }
    return new NextResponse('Bad Request', { status: 400 });
}

export async function POST(request) {
    try {
        const body = await request.json();

        // Check if it's a WhatsApp status update
        if (body.object === 'whatsapp_business_account') {
            body.entry?.forEach(entry => {
                entry.changes?.forEach(change => {
                    if (change.value.statuses) {
                        change.value.statuses.forEach(status => {
                            const wamid = status.id;
                            const statusState = status.status; // sent, delivered, read, failed
                            console.log(`Status Update - ID: ${wamid}, Status: ${statusState} `);
                            updateStatusStore(wamid, statusState);
                        });
                    }
                });
            });
            return new NextResponse('EVENT_RECEIVED', { status: 200 });
        }

        return new NextResponse('Not a WhatsApp event', { status: 404 });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
