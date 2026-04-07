'use client';

import { PinnedProfileList } from '@/components/profile';

export default function PinnedPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Закреплённые профили</h1>
      <PinnedProfileList />
    </div>
  );
}