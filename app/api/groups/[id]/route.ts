import { NextRequest, NextResponse } from 'next/server';
import { fetchProfileLists } from '@/utils/parser';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const lists = await fetchProfileLists();
  const profile = lists.groups.find(p => p.id === id);
  
  if (!profile) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const cookieStore = cookies();
  const pinnedCookie = cookieStore.get('pinned');
  const pinnedItems: string[] = pinnedCookie ? JSON.parse(pinnedCookie.value) : [];
  
  // Проверяем, есть ли ключ "group:id" в списке закреплённых
  const pinned = pinnedItems.includes(`group:${id}`);

  return NextResponse.json({ ...profile, type: 'group', pinned });
}