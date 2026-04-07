import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchProfileLists } from '@/utils/parser';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const pinnedCookie = cookieStore.get('pinned');
    const pinnedItems: string[] = pinnedCookie ? JSON.parse(pinnedCookie.value) : [];

    const lists = await fetchProfileLists();
    
    // Создаём карту для быстрого поиска профиля по типу и ID
    const profilesMap = new Map();
    lists.groups.forEach(p => profilesMap.set(`group:${p.id}`, { ...p, type: 'group' }));
    lists.teachers.forEach(p => profilesMap.set(`teacher:${p.id}`, { ...p, type: 'teacher' }));
    lists.auditories.forEach(p => profilesMap.set(`auditory:${p.id}`, { ...p, type: 'auditory' }));

    const pinnedProfiles = pinnedItems
      .map(key => profilesMap.get(key))
      .filter(p => p !== undefined); // Убираем несуществующие

    return NextResponse.json(pinnedProfiles);
  } catch (error) {
    console.error('Error in /api/profiles/pinned:', error);
    return NextResponse.json({ error: 'Failed to fetch pinned profiles' }, { status: 500 });
  }
}