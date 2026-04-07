// Убираем импорт из supabase, так как он больше не нужен
// import { Database } from "./supabase";

export interface AvtorTeacher {
  teacher_name: string;
}

export interface AvtorAuditory {
  auditory_name: string;
}

export interface AvtorLesson {
  subject: string;
  type: string;
  subgroup: number;
  time_start: string;
  time_end: string;
  time: number;
  week: number;
  date?: string;
  teachers: AvtorTeacher[];
  auditories: AvtorAuditory[];
}

export interface AvtorDay {
  weekday: number;
  lessons?: AvtorLesson[];
}

export interface AvtorGroup {
  group_name: string;
  course: number;
  faculty: string;
  changes: number;
  days: AvtorDay[];
}

export interface AvtorWeek {
  week_number: number;
  date_start: string;
  date_end: string;
  groups: AvtorGroup[];
}

export type AvtorTimetable = {
  timetable: AvtorWeek[]
}

// --- Типы для нашего приложения ---

// Базовый профиль (группа, преподаватель, аудитория)
export interface ProfileRow {
  id: string;
  name: string;
  type: string;          // 'group', 'teacher', 'auditory'
  description?: string | null;
  pinned?: boolean;
}

// Связанный профиль (для уроков)
export interface LinkedProfile {
  id: string;
  name: string;
}

export interface SubgroupItem {
  number?: number;
  teacher?: LinkedProfile | null;
  auditory?: LinkedProfile | null;
  group?: LinkedProfile | null;
}

// Расширенная строка урока (то, что приходит из парсера)
export interface ExtendedLessonRow {
  number?: string | number;
  name?: string;
  time_start?: string;
  time_end?: string;
  teacher?: LinkedProfile | null;
  auditory?: LinkedProfile | null;
  group?: LinkedProfile | null;
  subgroups?: SubgroupItem[];
}

// День с уроками
export type Weekday = { date: string; lessons: ExtendedLessonRow[] };

// Для обратной совместимости (если где-то используется LessonRow)
export type LessonRow = any; // или можно определить пустой интерфейс
export type CollegeRow = any;
export type _ProfileRow = ProfileRow;