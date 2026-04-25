import type { TFunction } from 'i18next';
import type { ClubAttendanceReasonInterface } from '@/types/practices/types';

/** Resolve the display label for an attendance reason. Seeded defaults
 * carry a stable `key` so we can i18n them; custom reasons fall back to
 * the raw `name` stored by the club. */
export function reasonLabel(
  t: TFunction,
  reason: Pick<ClubAttendanceReasonInterface, 'key' | 'name'>
): string {
  if (reason.key) {
    return t(`practice.attendance.reasons.${reason.key}`, {
      defaultValue: reason.name,
    });
  }
  return reason.name;
}
