import { NextRequest, NextResponse } from 'next/server';
import { fetchSchedule } from '@/utils/parser';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const pathParts = req.nextUrl.pathname.split('/');
  const entityType = pathParts[2] as 'groups' | 'teachers' | 'auditories';

  try {
    const schedule = await fetchSchedule(entityType, id);
    return NextResponse.json(schedule);
  } catch (error) {
    console.error(`Failed to fetch schedule for ${entityType}/${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}