import { NextRequest, NextResponse } from 'next/server';
import { fetchProfileLists } from '@/utils/parser'
import { cookies } from 'next/headers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const lists = await fetchProfileLists();

  // Сначала ищем в группах
  let profile = lists.groups.find(p => p.id === id);
  let type = 'group';

  // Если не нашли, ищем в преподавателях
  if (!profile) {
    profile = lists.teachers.find(p => p.id === id);
    type = 'teacher';
  }

  // Если не нашли, ищем в аудиториях
  if (!profile) {
    profile = lists.auditories.find(p => p.id === id);
    type = 'auditory';
  }

  if (!profile) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const cookieStore = cookies();
  const pinnedCookie = cookieStore.get('pinned');
  const pinnedIds = pinnedCookie ? JSON.parse(pinnedCookie.value) : [];
  const pinned = pinnedIds.includes(parseInt(id));

  return NextResponse.json({ ...profile, type, pinned });
}