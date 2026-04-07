import { redirect } from 'next/navigation';
import { fetchProfileLists } from '@/utils/parser';

export default async function OldProfilePage({ params }: { params: { id: string } }) {
  const lists = await fetchProfileLists();
  const all = [...lists.groups, ...lists.teachers, ...lists.auditories];
  const profile = all.find(p => p.id === params.id);
  if (!profile) {
    redirect('/');
  }
  
  let type = 'group';
  if (lists.teachers.some(t => t.id === params.id)) type = 'teacher';
  else if (lists.auditories.some(a => a.id === params.id)) type = 'auditory';
  
  redirect(`/${type}/${params.id}`);
}