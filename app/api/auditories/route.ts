import { NextResponse } from 'next/server';
import { fetchProfileLists } from '@/utils/parser';

export async function GET() {
  const lists = await fetchProfileLists();
  const auditories = lists.auditories.map(a => ({ ...a, type: 'auditory' }));
  return NextResponse.json(auditories);
}