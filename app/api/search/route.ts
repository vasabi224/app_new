import { NextRequest, NextResponse } from 'next/server';
import { fetchProfileLists } from '@/utils/parser';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  const lists = await fetchProfileLists();
  const all = [
    ...lists.groups.map(g => ({ ...g, type: 'group' })),
    ...lists.teachers.map(t => ({ ...t, type: 'teacher' })),
    ...lists.auditories.map(a => ({ ...a, type: 'auditory' })),
  ];
  const results = all.filter(item => item.name.toLowerCase().includes(q.toLowerCase())).slice(0, 20);
  return NextResponse.json(results);
}