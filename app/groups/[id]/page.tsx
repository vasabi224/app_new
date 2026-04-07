'use client';

import { Card } from '@/components/card';
import { Weekdays } from '@/components/lesson';
import Loader from '@/components/loader';
import Placeholder from '@/components/placeholder';
import { CopyProfileLink, PinProfileButton } from '@/components/profile';
import useSWR from 'swr';

export default function GroupPage({ params }: { params: { id: string } }) {
  const { data: profile, isLoading, error } = useSWR(`/api/groups/${params.id}`);

  if (isLoading) return <Loader />;
  if (error) return <Placeholder title="Упс" description="Не удалось загрузить профиль, может еще раз?" />;

  return (
    <Card
      key={profile.id}
      title={profile.name}
      description={profile.description!}
      caption="group"
      actions={[
        <PinProfileButton profile={profile} key="pin" />,
        <CopyProfileLink profile={profile} key="copy" />
      ]}
    >
      <Weekdays profileId={profile.id} profileType="group" />
    </Card>
  );
}