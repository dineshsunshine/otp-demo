import { NextResponse } from 'next/server';
import { getStatus } from '@/lib/store';

export async function POST(request) {
    try {
        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
        }

        const statuses = {};
        ids.forEach(id => {
            statuses[id] = getStatus(id);
        });

        return NextResponse.json({ statuses });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
