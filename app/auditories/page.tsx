'use client';

import { ProfileList } from '@/components/profile';
import useSWR from 'swr';
import Loader from '@/components/loader';
import Placeholder from '@/components/placeholder';

export default function AuditoriesPage() {
  const { data: profiles, isLoading, error } = useSWR('/api/auditories');

  if (isLoading) return <Loader />;
  if (error) return <Placeholder title="Ошибка" description="Не удалось загрузить аудитории" />;

  return <ProfileList profiles={profiles} />;
}