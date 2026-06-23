import { taskDateStr } from '../hooks/useTasks';
import { AREA_MAP } from '../constants/areas';

function formatICSDate(dateStr) {
  // "YYYY-MM-DD" → "YYYYMMDD" (종일 이벤트)
  return dateStr.replace(/-/g, '');
}

function escapeICS(str) {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function exportToICS(tasks, label) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//업무 스케줄러//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS(label)}`,
    'X-WR-TIMEZONE:Asia/Seoul',
  ];

  tasks.forEach(task => {
    const ds = taskDateStr(task);
    if (!ds) return;
    const dateVal = formatICSDate(ds);
    // 종일 이벤트는 DTEND에 다음날 날짜를 씀
    const [y, m, d] = ds.split('-').map(Number);
    const next = new Date(y, m - 1, d + 1);
    const pad = n => String(n).padStart(2, '0');
    const nextStr = `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;

    const area = AREA_MAP[task.area] || AREA_MAP.etc;
    const uid = `${task.id}@scheduler`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTART;VALUE=DATE:${dateVal}`);
    lines.push(`DTEND;VALUE=DATE:${nextStr}`);
    lines.push(`SUMMARY:${escapeICS(`[${area.short}] ${task.title}`)}`);
    lines.push(`CATEGORIES:${escapeICS(area.label)}`);
    if (task.completed) lines.push('STATUS:COMPLETED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  const content = lines.join('\r\n');
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `업무_${label}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
