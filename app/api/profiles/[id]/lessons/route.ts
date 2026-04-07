import { NextRequest, NextResponse } from 'next/server';
import { fetchSchedule } from '@/utils/parser';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get('type'); // group, teacher, auditory

  if (!type) {
    return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 });
  }

  const entityType = type + 's' as 'groups' | 'teachers' | 'auditories';
  try {
    const schedule = await fetchSchedule(entityType, id);
    return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}