import { environment } from 'src/environments/environment';
import { OccurrenceSet, TimeRange, TimeString } from '../data/models';

export function sameDay(d1: Date, d2: Date) {
  return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}

export const BurningManTimeZone = 'America/Los_Angeles';
export const CurrentYear = 'ttitd-2023';

export function now(): Date {
  if (!environment.simulatedTime) {
    return nowPST();
  }
  return structuredClone(environment.simulatedTime);
}

export function nowPST(): Date {
  let str = new Date().toLocaleString('en-US', { timeZone: BurningManTimeZone });
  return new Date(str);
}

export function nowRange(): TimeRange {
  const start = now();
  const end = now();
  const minute = 1000 * 60;
  start.setTime(start.getTime() - 20 * minute);
  end.setTime(end.getTime() + 60 * minute);
  console.log(start, end);
  return { start, end };
}

export function timeRangeToString(timeRange: TimeRange | undefined): string {
  if (!timeRange) {
    return '';
  }
  return `${time(timeRange.start)}-${time(timeRange.end)}`;
}

/**
 * Case Insensitive Compare of 2 strings
 *
 * @export
 * @param {string} s1
 * @param {string} s2
 * @returns {boolean} true if the strings are the same
 */
export function compareStr(s1: string, s2: string): boolean {
  return s1.localeCompare(s2, undefined, { sensitivity: 'accent' }) == 0;
}

export function randomInt(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

export function noDate(): Date {
  return new Date(0);
}

export function dateMatches(d: Date, occurrence: OccurrenceSet): boolean {
  const day = d.toISOString();
  const ds = day.split('T');
  return occurrence.start_time.startsWith(ds[0]) || occurrence.end_time.startsWith(ds[0]);
}

export function uniqueId(prefix: string): string {
  return `${prefix}${Math.floor(Math.random() * 9999999)}`;
}

export function getDayName(dateStr: string) {
  var date = new Date(dateStr);
  return date.toLocaleDateString([], { weekday: 'long' }) + ` ${getOrdinalNum(date.getDate())}`;
}

export function getDayNameFromDate(date: Date): string {
  return date.toLocaleDateString([], { weekday: 'long' });
}

export function getOrdinalNum(n: number) {
  return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
}

export function daysUntil(date1: any, date2: any) {
  // The number of milliseconds in one day
  const ONE_DAY = 1000 * 60 * 60 * 24;

  // Calculate the difference in milliseconds
  const differenceMs = date1 - date2;

  // Convert back to days and return
  return Math.round(differenceMs / ONE_DAY);
}

export function minutesBetween(date2: Date, date1: Date) {
  var differenceValue = (date2.getTime() - date1.getTime()) / 1000;
  differenceValue /= 60;
  return Math.abs(Math.round(differenceValue));
}

export function addDays(date: Date, days: number) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function time(d: Date): string {
  // Burning Man is in PST timezone so report it that way in the UI (useful for people looking in other timezones)
  const s = d
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: BurningManTimeZone })
    .toLowerCase()
    .replace(' ', '')
    .replace(':00', '');
  if (s == '12am') return 'Midnight';
  if (s == '12pm') return 'Noon';
  return s;
}

export function getOccurrenceTimeString(start: Date, end: Date, day: Date | undefined): TimeString | undefined {
  const startsToday = day && sameDay(start, day);
  const endsToday = day && sameDay(end, day);
  if (!day || startsToday || endsToday) {
    const day = start.toLocaleDateString([], { weekday: 'long' });
    const short =
      endsToday && !startsToday
        ? `Until ${time(end)} (${timeBetween(end, start)})`
        : `${time(start)} (${timeBetween(end, start)})`;

    return {
      long: `${day} ${time(start)}-${time(end)} (${timeBetween(end, start)})`,
      short,
    };
  }
  return undefined;
}

export function isWhiteSpace(s: string): boolean {
  if (!s) return true;
  if (s.trim() == '') return true;
  return false;
}

function timeBetween(d1: any, d2: any): string {
  const hrs = Math.ceil(Math.abs(d1 - d2) / 36e5);
  const mins = Math.floor(Math.abs(d1 - d2) / 1000 / 60);
  return mins < 60 ? `${mins}mins` : `${hrs}hrs`;
}

export function secondsBetween(d1: any, d2: any): number {
  return Math.floor(Math.abs(d1 - d2) / 1000.0);
}
