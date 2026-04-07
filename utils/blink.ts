import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import dayjs from '@/utils/dayjs';

export const getPinnedProfileIds = (cookieStore: ReadonlyRequestCookies): number[] => {
  const cookie = cookieStore.get('pinned');
  return cookie ? JSON.parse(cookie.value) : [];
};

export const pinProfile = (cookieStore: ReadonlyRequestCookies, id: number): number[] => {
  const pinned = getPinnedProfileIds(cookieStore);
  if (!pinned.includes(id)) pinned.push(id);
  cookieStore.set('pinned', JSON.stringify(pinned), { maxAge: 31536000, path: '/' });
  return pinned;
};

export const unpinProfile = (cookieStore: ReadonlyRequestCookies, id: number): number[] => {
  let pinned = getPinnedProfileIds(cookieStore);
  pinned = pinned.filter(pid => pid !== id);
  cookieStore.set('pinned', JSON.stringify(pinned), { maxAge: 31536000, path: '/' });
  return pinned;
};

export function dateToISO(date: string): string {
  return dayjs(date, 'D-MM-YYYY').format('YYYY-MM-DD');
}

export const isProd = process.env.NODE_ENV === 'production';
export const protocol = isProd ? 'https://' : 'http://';
export const SITE_URL = `${protocol}${isProd ? process.env.NEXT_PUBLIC_SITE_URL : 'localhost:3000'}`;

export const api = {
  get: async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  },
  post: async (url: string, data?: any) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to post');
    return await res.json();
  },
  delete: async (url: string, data?: any) => {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to delete');
    return await res.json();
  },
};

export const fetcher = (url: string) => fetch(url).then(res => res.json());