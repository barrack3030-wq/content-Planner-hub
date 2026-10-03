/**
 * Date utility functions for Content Planner
 * Standardizing on Monday - Sunday week boundaries
 */

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

// Get the Monday of the week for a given date
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // In JS getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get the Sunday of the week for a given date
export function getSundayOfWeek(monday: Date): Date {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseISODate(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatFullDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseISODate(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatWeekRange(monday: Date): string {
  const sunday = getSundayOfWeek(monday);
  const startMonth = monday.toLocaleDateString('en-US', { month: 'short' });
  const startDay = monday.getDate();
  const endMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
  const endDay = sunday.getDate();
  const year = sunday.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}

export function getDaysOfWeek(monday: Date): { dayName: string; shortDay: string; dateStr: string; dateNumber: number; isToday: boolean }[] {
  const todayStr = formatDateToISO(new Date());
  const days: { dayName: string; shortDay: string; dateStr: string; dateNumber: number; isToday: boolean }[] = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const dateStr = formatDateToISO(current);
    days.push({
      dayName: dayNames[i],
      shortDay: shortDays[i],
      dateStr,
      dateNumber: current.getDate(),
      isToday: dateStr === todayStr,
    });
  }

  return days;
}

export function isDateInWeek(dateStr: string, monday: Date): boolean {
  if (!dateStr) return false;
  const target = parseISODate(dateStr).getTime();
  const start = new Date(monday).setHours(0, 0, 0, 0);
  const end = getSundayOfWeek(monday).setHours(23, 59, 59, 999);
  return target >= start && target <= end;
}

export function isDateInMonth(dateStr: string, year: number, month: number): boolean {
  if (!dateStr) return false;
  const d = parseISODate(dateStr);
  return d.getFullYear() === year && d.getMonth() === month;
}

export function getMonthName(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
