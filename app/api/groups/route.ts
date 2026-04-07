import { NextResponse } from 'next/server';
import { fetchProfileLists } from '@/utils/parser';

export async function GET() {
  const lists = await fetchProfileLists();
  const groups = lists.groups.map(g => ({ ...g, type: 'group' }));
  return NextResponse.json(groups);
}