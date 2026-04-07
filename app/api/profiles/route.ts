import { NextRequest, NextResponse } from 'next/server';
import { fetchProfileLists } from '@/utils/parser';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get('type'); // group, teacher, auditory
  const lists = await fetchProfileLists();

  let result = [];
  if (type === 'group') result = lists.groups;
  else if (type === 'teacher') result = lists.teachers;
  else if (type === 'auditory') result = lists.auditories;
  else result = [...lists.groups, ...lists.teachers, ...lists.auditories];

  return NextResponse.json(result);
}