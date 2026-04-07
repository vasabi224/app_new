import { NextResponse } from 'next/server';
import { fetchProfileLists } from '@/utils/parser';

export async function GET() {
  const lists = await fetchProfileLists();
  const teachers = lists.teachers.map(t => ({ ...t, type: 'teacher' }));
  return NextResponse.json(teachers);
}