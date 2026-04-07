import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic'; // Решает проблему DynamicServerError

export async function POST(req: NextRequest) {
  try {
    const { id, type } = await req.json();
    if (!id || !type) {
      return NextResponse.json({ error: 'Missing id or type' }, { status: 400 });
    }

    const cookieStore = cookies();
    const pinnedCookie = cookieStore.get('pinned');
    let pinnedItems: string[] = pinnedCookie ? JSON.parse(pinnedCookie.value) : [];
    
    const itemKey = `${type}:${id}`;
    if (!pinnedItems.includes(itemKey)) {
      pinnedItems.push(itemKey);
    }
    
    cookieStore.set('pinned', JSON.stringify(pinnedItems), { 
      maxAge: 31536000, 
      path: '/' 
    });
    
    return NextResponse.json({ success: true, pinned: pinnedItems });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, type } = await req.json();
    if (!id || !type) {
      return NextResponse.json({ error: 'Missing id or type' }, { status: 400 });
    }

    const cookieStore = cookies();
    const pinnedCookie = cookieStore.get('pinned');
    let pinnedItems: string[] = pinnedCookie ? JSON.parse(pinnedCookie.value) : [];
    
    const itemKey = `${type}:${id}`;
    pinnedItems = pinnedItems.filter(item => item !== itemKey);
    
    cookieStore.set('pinned', JSON.stringify(pinnedItems), { 
      maxAge: 31536000, 
      path: '/' 
    });
    
    return NextResponse.json({ success: true, pinned: pinnedItems });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}