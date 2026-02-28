export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTimeRange = (start: string, end: string): string => {
  const s = new Date(start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const e = new Date(end).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `${s} – ${e}`;
};

export const isToday = (iso: string): boolean => {
  return new Date(iso).toDateString() === new Date().toDateString();
};

export const isOverdue = (deadline: string): boolean => {
  return new Date(deadline).getTime() < new Date().getTime();
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getMonthMatrix = (year: number, month: number): (Date | null)[][] => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const matrix: (Date | null)[][] = [];
  let week: (Date | null)[] = Array(firstDay).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(new Date(year, month, day));
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    matrix.push([...week, ...Array(7 - week.length).fill(null)]);
  }

  return matrix;
};

export const getWeekDayShort = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
};
