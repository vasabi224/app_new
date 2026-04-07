import axios from 'axios';
import * as cheerio from 'cheerio';
import Agent from 'agentkeepalive';
import { SubgroupItem } from '@/types';

const BASE_URL = 'https://tktts-rasp.ru';

// Настройка keep-alive агентов
const keepAliveAgent = new Agent({
  maxSockets: 20,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000,
});
const keepAliveHttpsAgent = new Agent.HttpsAgent({
  maxSockets: 20,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000,
});

const axiosInstance = axios.create({
  httpAgent: keepAliveAgent,
  httpsAgent: keepAliveHttpsAgent,
  timeout: 15000,
});

// Кэш для расписаний с TTL 2 минуты
const scheduleCache = new Map<string, {
  data: any;
  etag: string | null;
  lastModified: string | null;
  timestamp: number;
}>();
const CACHE_TTL = 2 * 60 * 1000; // 2 минуты

export interface ProfileItem {
  id: string;
  name: string;
}

export interface Lesson {
  number: string;
  name: string;
  time_start: string;
  time_end: string;
  teacher?: { id: string; name: string } | null;
  auditory?: { id: string; name: string } | null;
  group?: { id: string; name: string } | null;
  subgroups?: SubgroupItem[];
}

export interface DaySchedule {
  date: string;
  lessons: Lesson[];
}

export async function fetchProfileLists(): Promise<{
  groups: ProfileItem[];
  teachers: ProfileItem[];
  auditories: ProfileItem[];
}> {
  const { data } = await axiosInstance.get(BASE_URL);
  const $ = cheerio.load(data);
  const groups: ProfileItem[] = [];
  const teachers: ProfileItem[] = [];
  const auditories: ProfileItem[] = [];

  $('#search-objects-select optgroup').each((_, optgroup) => {
    const label = $(optgroup).attr('label') || '';
    let target: ProfileItem[] | null = null;
    if (label.includes('Группы')) target = groups;
    else if (label.includes('Преподаватели')) target = teachers;
    else if (label.includes('Аудитории')) target = auditories;
    else return;

    $(optgroup).find('option').each((_, opt) => {
      const value = $(opt).attr('value') || '';
      const id = value.split('/').pop() || '';
      const name = $(opt).text().trim();
      if (id && name) target!.push({ id, name });
    });
  });

  return { groups, teachers, auditories };
}

// Оптимизированная функция получения расписания с условными запросами
export async function fetchSchedule(
  entityType: 'groups' | 'teachers' | 'auditories',
  entityId: string
): Promise<DaySchedule[]> {
  const cacheKey = `${entityType}/${entityId}`;
  const cached = scheduleCache.get(cacheKey);
  const now = Date.now();

  // Если кэш ещё не истёк, возвращаем его (но всё равно проверим ETag асинхронно, если нужно)
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    // Фоновое обновление, если кэш скоро устареет (опционально)
    if ((now - cached.timestamp) > CACHE_TTL / 2) {
      refreshCacheInBackground(cacheKey, entityType, entityId);
    }
    return cached.data;
  }

  // Иначе делаем запрос с условными заголовками
  const headers: any = {};
  if (cached?.etag) headers['If-None-Match'] = cached.etag;
  if (cached?.lastModified) headers['If-Modified-Since'] = cached.lastModified;

  try {
    const url = `${BASE_URL}/${entityType}/${entityId}`;
    const response = await axiosInstance.get(url, { headers, validateStatus: (s) => s < 500 });
    
    if (response.status === 304 && cached) {
      // Не изменилось – обновляем timestamp и возвращаем старые данные
      scheduleCache.set(cacheKey, { ...cached, timestamp: now });
      return cached.data;
    }
    
    // Изменилось – парсим и сохраняем
    const html = response.data;
    const schedule = parseSchedule(html);
    const etag = response.headers.etag || null;
    const lastModified = response.headers['last-modified'] || null;
    scheduleCache.set(cacheKey, { data: schedule, etag, lastModified, timestamp: now });
    return schedule;
  } catch (error) {
    console.error(`[parser] Error fetching ${cacheKey}:`, error);
    if (cached) return cached.data;
    throw error;
  }
}

// Фоновая проверка обновлений (для "почти устаревшего" кэша)
async function refreshCacheInBackground(key: string, entityType: string, entityId: string) {
  try {
    const cached = scheduleCache.get(key);
    if (!cached) return;
    const headers: any = {};
    if (cached.etag) headers['If-None-Match'] = cached.etag;
    if (cached.lastModified) headers['If-Modified-Since'] = cached.lastModified;
    const url = `${BASE_URL}/${entityType}/${entityId}`;
    const response = await axiosInstance.get(url, { headers, validateStatus: (s) => s < 500 });
    if (response.status === 304) {
      // Не изменилось, обновим timestamp
      scheduleCache.set(key, { ...cached, timestamp: Date.now() });
    } else {
      // Изменилось – перезаписываем
      const newSchedule = parseSchedule(response.data);
      scheduleCache.set(key, {
        data: newSchedule,
        etag: response.headers.etag || null,
        lastModified: response.headers['last-modified'] || null,
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    console.error(`Background refresh failed for ${key}`, err);
  }
}

// Парсинг HTML (без изменений, но можно оптимизировать селекторы)
function parseSchedule(html: string): DaySchedule[] {
  const $ = cheerio.load(html);
  const schedule: DaySchedule[] = [];
  const dateHeaders = $('.dateHeader');
  dateHeaders.each((_, header) => {
    const headerEl = $(header);
    const headerText = headerEl.text();
    const dateMatch = headerText.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (!dateMatch) return;
    const [, day, month, year] = dateMatch;
    const dateStr = `${year}-${month}-${day}`;

    const lessons: Lesson[] = [];
    let nextEl = headerEl.next();
    while (nextEl.length && !nextEl.hasClass('dateHeader')) {
      nextEl.find('.lesson').each((_, lessonEl) => {
        const lesson = parseLesson($(lessonEl));
        if (lesson) lessons.push(lesson);
      });
      nextEl = nextEl.next();
    }
    schedule.push({ date: dateStr, lessons });
  });
  return schedule;
}

function parseLesson(element: cheerio.Cheerio<any>): Lesson | null {
  try {
    const number = element.find('.number').text().trim() || '?';
    const timeText = element.find('.time').text().trim();
    let timeStart = '', timeEnd = '';
    if (timeText.includes('-')) {
      const parts = timeText.split('-').map(p => p.trim());
      timeStart = parts[0] || '';
      timeEnd = parts[1] || '';
    }

    // Название предмета
    let name = '';
    const timeElement = element.find('.time');
    if (timeElement.length) {
      const nameElement = timeElement.next('div');
      if (nameElement.length) {
        name = nameElement.text().trim();
      }
    }
    if (!name) {
      const allDivs = element.find('div');
      if (allDivs.length >= 3) name = allDivs.eq(2).text().trim();
    }

    // Подгруппы
    const subgroups: SubgroupItem[] = [];
    const subgroupIndicators = element.find('div.text-muted:contains("Подгруппа №")');
    subgroupIndicators.each((index, indicator) => {
      const indicatorEl = subgroupIndicators.eq(index);
      const indicatorText = indicatorEl.text().trim();
      const numberMatch = indicatorText.match(/Подгруппа №(\d+)/);
      const subNumber = numberMatch ? parseInt(numberMatch[1]) : index + 1;

      const nextEl = indicatorEl.next();
      if (nextEl.length && nextEl.hasClass('d-flex')) {
        const teacherLink = nextEl.find('a[href*="/teachers/"]');
        const teacher = teacherLink.length
          ? { id: teacherLink.attr('href')!.split('/').pop()!, name: teacherLink.text().trim() }
          : null;
        const auditoryLink = nextEl.find('a[href*="/auditories/"]');
        const auditory = auditoryLink.length
          ? { id: auditoryLink.attr('href')!.split('/').pop()!, name: auditoryLink.text().trim() }
          : null;
        const groupLink = nextEl.find('a[href*="/groups/"]');
        const group = groupLink.length
          ? { id: groupLink.attr('href')!.split('/').pop()!, name: groupLink.text().trim() }
          : null;
        subgroups.push({ number: subNumber, teacher, auditory, group });
      }
    });

    let teacher = null, auditory = null, group = null;
    if (!subgroups.length) {
      const teacherLink = element.find('a[href*="/teachers/"]');
      teacher = teacherLink.length ? { id: teacherLink.attr('href')!.split('/').pop()!, name: teacherLink.text().trim() } : null;
      const auditoryLink = element.find('a[href*="/auditories/"]');
      auditory = auditoryLink.length ? { id: auditoryLink.attr('href')!.split('/').pop()!, name: auditoryLink.text().trim() } : null;
      const groupLink = element.find('a[href*="/groups/"]');
      group = groupLink.length ? { id: groupLink.attr('href')!.split('/').pop()!, name: groupLink.text().trim() } : null;
    }

    return {
      number,
      name: name || '—',
      time_start: timeStart,
      time_end: timeEnd,
      teacher,
      auditory,
      group,
      subgroups: subgroups.length ? subgroups : undefined,
    };
  } catch (err) {
    console.error('[parser] parseLesson error:', err);
    return null;
  }
}