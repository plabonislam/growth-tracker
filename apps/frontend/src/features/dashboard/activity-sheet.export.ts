import type { ActivitySheet } from './activity-sheet.types';

/** Wraps a cell so commas, quotes and newlines in a name can't break the row. */
function cell(value: string | number | null): string {
  if (value === null) return '';
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function row(cells: (string | number | null)[]): string {
  return cells.map(cell).join(',');
}

/**
 * The sheet as a CSV, in the order it is read on screen: the figures, then the
 * session log, then the roster. Built from what the page already holds, so the
 * export never disagrees with what it was generated from.
 */
export function sheetToCsv(sheet: ActivitySheet): string {
  const lines: string[] = [
    row([sheet.clubName, sheet.monthLabel]),
    '',
    row(['Metric', 'Value', 'Unit', 'Note']),
    ...sheet.metrics.map((m) => row([m.label, m.value, m.unit ?? '', m.note])),
    '',
    row([
      'Date',
      'Weekday',
      'Cadence',
      'Objective',
      'Facilitator',
      'Attendance',
    ]),
    ...sheet.sessions.map((s) =>
      row([
        s.day,
        s.weekday,
        s.cadence,
        s.objective,
        s.facilitator,
        // Empty rather than 0 — a headcount that was never taken is not zero.
        s.attendance,
      ]),
    ),
    '',
    row(['Member', 'Role', 'Status']),
    ...sheet.roster.map((m) =>
      row([m.name, m.role, m.onBreak ? 'On break' : 'Active']),
    ),
  ];

  return lines.join('\n');
}

/** "DBA Club — December 2025" → `dba-club-december-2025.csv`. */
export function sheetFileName(sheet: ActivitySheet): string {
  const slug = `${sheet.clubName} ${sheet.monthLabel}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${slug || 'activity-sheet'}.csv`;
}

/** Hands the CSV to the browser as a download. */
export function downloadSheet(sheet: ActivitySheet): void {
  const blob = new Blob([sheetToCsv(sheet)], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = sheetFileName(sheet);
  link.click();
  URL.revokeObjectURL(url);
}
