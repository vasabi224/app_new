import { ProfileRow } from '@/types';
import { SITE_URL } from '@/utils/blink';
import { HelpCircle, Link2, Pin, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { Card } from './card';
import Loader from './loader';
import Placeholder from './placeholder';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';

export function ProfileList({ profiles }: { profiles: ProfileRow[] }) {
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileRow[]>(profiles || []);

  const onSearch = (keyword: string) => {
    const filtered = profiles.filter((profile: ProfileRow) =>
      profile.name!.toLowerCase().includes(keyword.toLowerCase())
    );
    setFilteredProfiles(filtered);
  };

  return (
    <div className="profiles flex flex-col gap-2">
      <div className="searchbar flex items-center gap-2">
        <Search />
        <Input
          onChange={(e) => onSearch(e.target.value)}
          type="text"
          className="bg-muted"
          placeholder="Поиск..."
        />
      </div>

      <div className="profiles-list grid gap-2 lg:grid-cols-3">
        {filteredProfiles.length ? (
          filteredProfiles.map((profile: ProfileRow) => {
            // Для аудиторий используем правильное множественное число 'auditories'
            const profilePath =
              profile.type === 'auditory'
                ? `/auditories/${profile.id}`
                : `/${profile.type}s/${profile.id}`;

            return (
              <Link key={profile.id} href={profilePath}>
                <Card
                  title={profile.name}
                  description={profile.description!}
                  caption={profile.type}
                />
              </Link>
            );
          })
        ) : (
          <Placeholder
            title="Упс"
            description="Кажется тут ничего нет"
            icon={<HelpCircle />}
          />
        )}
      </div>
    </div>
  );
}

export function CopyProfileLink({ profile }: { profile: ProfileRow }) {
  const { toast } = useToast();

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(`${SITE_URL}/${profile.type}/${profile.id}`);
      toast({
        title: 'Ссылка на профиль скопирована',
      });
    } catch {
      toast({
        title: 'Не удалось скопировать ссылку',
      });
    }
  };

  return (
    <Button onClick={onClick} variant="outline" size="icon">
      <Link2 className="h-5 w-5" />
    </Button>
  );
}

export function PinProfileButton({ profile }: { profile: ProfileRow }) {
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);

  const handlePin = async () => {
    setLoading(true);
    const method = profile.pinned ? 'DELETE' : 'POST';
    try {
      const res = await fetch('/api/pin', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: parseInt(profile.id), 
          type: profile.type 
        }),
      });
      if (res.ok) {
        // Инвертируем pinned локально (для немедленного обновления UI)
        profile.pinned = !profile.pinned;
        // Затем мутируем, чтобы синхронизировать с сервером
        mutate(`/api/${profile.type}s/${profile.id}`);
        mutate('/api/profiles/pinned');
      }
    } catch (error) {
      console.error('Failed to pin/unpin', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePin} 
      size="icon" 
      variant={profile.pinned ? 'outline' : 'default'}
      disabled={loading}
    >
      <Pin className="h-5 w-5" />
    </Button>
  );
}

export function PinnedProfileList() {
  const { data: profiles, isLoading, error } = useSWR('/api/profiles/pinned');

  if (isLoading) return <Loader />;
  if (error) return <div>Ошибка загрузки закреплённых</div>;
  if (!profiles?.length) return null;

  return (
    <div className="pinned-profiles flex flex-col gap-2 p-2 border rounded-md">
      <div className="caption flex items-center gap-1 text-muted-foreground">
        <Pin className="h-4 w-4" /> Закреплённые
      </div>
      <div className="grid gap-2 lg:grid-cols-3">
        {profiles.map((profile: any) => {
          const profilePath =
            profile.type === 'auditory'
              ? `/auditories/${profile.id}`
              : `/${profile.type}s/${profile.id}`;

          const typeCaption = 
            profile.type === 'group' ? 'Группа' :
            profile.type === 'teacher' ? 'Преподаватель' : 'Аудитория';

          return (
            <Link key={`${profile.type}:${profile.id}`} href={profilePath}>
              <Card title={profile.name} caption={typeCaption} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}