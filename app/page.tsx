'use client';

import { Card } from '@/components/card';
import { PinnedProfileList } from '@/components/profile';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col gap-2">
        <PinnedProfileList />

        <Link href={'/groups'}>
          <Card caption={'Расписание'} title="Группы" />
        </Link>
        <Link href={'/teachers'}>
          <Card caption={'Расписание'} title="Преподаватели" />
        </Link>
        <Link href={'/auditories'}>
          <Card caption={'Расписание'} title="Аудитории" />
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <Link href={''}>
            <Card caption={'Обратная связь'} title="Поддержать проект" />
          </Link>
          <Link href={'https://t.me/new_blink'}>
            <Card caption={'Обратная связь'} title="Канал в Telegram" />
          </Link>
        </div>
      </div>
    </div>
  );
}
