'use client';

import { ProfileList } from '@/components/profile';
import useSWR from 'swr';
import Loader from '@/components/loader';
import Placeholder from '@/components/placeholder';

export default function TeachersPage() {
  const { data: profiles, isLoading, error } = useSWR('/api/teachers');

  if (isLoading) return <Loader />;
  if (error) return <Placeholder title="Ошибка" description="Не удалось загрузить преподавателей" />;

  return <ProfileList profiles={profiles} />;
}