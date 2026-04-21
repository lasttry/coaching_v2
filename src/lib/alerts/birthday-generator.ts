import { AlertCategory, AlertRecipientStatus, AlertType, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

const BIRTHDAY_WINDOW_DAYS = 7;

export const ATHLETE_BIRTHDAY_REFERENCE_TYPE = 'athlete';

/**
 * Computes the UTC date (00:00:00) of the next occurrence of the given month/day,
 * starting from `from`. If `from` matches month/day, `from` itself (at 00:00 UTC) is returned.
 */
function nextBirthdayOccurrence(from: Date, month: number, day: number): Date {
  const year = from.getUTCFullYear();
  let next = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const fromAtMidnight = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 0, 0, 0, 0)
  );
  if (next.getTime() < fromAtMidnight.getTime()) {
    next = new Date(Date.UTC(year + 1, month, day, 0, 0, 0, 0));
  }
  return next;
}

function daysBetween(a: Date, b: Date): number {
  const MS_IN_DAY = 24 * 60 * 60 * 1000;
  const aMid = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bMid = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((bMid - aMid) / MS_IN_DAY);
}

interface GenerationResult {
  alertsCreated: number;
  alertsExisting: number;
  recipientsCreated: number;
  recipientsExisting: number;
}

/**
 * Generates birthday alerts for athletes of a given club whose birthday is within
 * the next BIRTHDAY_WINDOW_DAYS days (including today). Idempotent: safe to run
 * multiple times per day.
 */
export async function generateAthleteBirthdayAlertsForClub(
  clubId: number,
  now: Date = new Date()
): Promise<GenerationResult> {
  const result: GenerationResult = {
    alertsCreated: 0,
    alertsExisting: 0,
    recipientsCreated: 0,
    recipientsExisting: 0,
  };

  const athletes = await prisma.athlete.findMany({
    where: {
      clubId,
      active: true,
      birthdate: { not: null },
    },
    select: {
      id: true,
      name: true,
      birthdate: true,
      teams: {
        select: {
          team: {
            select: {
              id: true,
              staff: {
                select: {
                  staff: {
                    select: {
                      accountId: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const clubAdmins = await prisma.accountClub.findMany({
    where: {
      clubId,
      roles: { some: { role: Role.ADMIN } },
    },
    select: { accountId: true },
  });
  const adminAccountIds = clubAdmins.map((c) => c.accountId);

  for (const athlete of athletes) {
    if (!athlete.birthdate) continue;
    const bd = new Date(athlete.birthdate);
    const month = bd.getUTCMonth();
    const day = bd.getUTCDate();
    const triggerDate = nextBirthdayOccurrence(now, month, day);
    const daysUntil = daysBetween(now, triggerDate);

    if (daysUntil < 0 || daysUntil > BIRTHDAY_WINDOW_DAYS) continue;

    const expiresAt = new Date(triggerDate.getTime() + 24 * 60 * 60 * 1000);

    const coachAccountIds = new Set<number>();
    for (const ta of athlete.teams) {
      for (const ts of ta.team.staff) {
        if (ts.staff.accountId !== null && ts.staff.accountId !== undefined) {
          coachAccountIds.add(ts.staff.accountId);
        }
      }
    }

    const recipientAccountIds = new Set<number>([...adminAccountIds, ...coachAccountIds]);
    if (recipientAccountIds.size === 0) continue;

    const isToday = daysUntil === 0;
    const title = isToday
      ? `Aniversário hoje — ${athlete.name}`
      : `Aniversário em ${daysUntil} dia(s) — ${athlete.name}`;
    const dateStr = triggerDate.toISOString().slice(0, 10);
    const message = isToday
      ? `${athlete.name} faz anos hoje (${dateStr}).`
      : `${athlete.name} faz anos em ${daysUntil} dia(s), a ${dateStr}.`;

    const alert = await prisma.alert.upsert({
      where: {
        clubId_category_referenceType_referenceId_triggerDate: {
          clubId,
          category: AlertCategory.ATHLETE_BIRTHDAY,
          referenceType: ATHLETE_BIRTHDAY_REFERENCE_TYPE,
          referenceId: athlete.id,
          triggerDate,
        },
      },
      update: {
        title,
        message,
        expiresAt,
      },
      create: {
        clubId,
        type: AlertType.INFO,
        category: AlertCategory.ATHLETE_BIRTHDAY,
        title,
        message,
        referenceType: ATHLETE_BIRTHDAY_REFERENCE_TYPE,
        referenceId: athlete.id,
        triggerDate,
        expiresAt,
      },
      select: { id: true, createdAt: true },
    });

    // Heuristic: if the alert was just created, createdAt is within the last few seconds.
    const isNewAlert = Date.now() - alert.createdAt.getTime() < 5000;
    if (isNewAlert) result.alertsCreated += 1;
    else result.alertsExisting += 1;

    for (const accountId of recipientAccountIds) {
      const created = await prisma.alertRecipient.upsert({
        where: {
          alertId_accountId: {
            alertId: alert.id,
            accountId,
          },
        },
        update: {},
        create: {
          alertId: alert.id,
          accountId,
          status: AlertRecipientStatus.UNREAD,
        },
        select: { createdAt: true },
      });
      if (Date.now() - created.createdAt.getTime() < 5000) result.recipientsCreated += 1;
      else result.recipientsExisting += 1;
    }
  }

  return result;
}

/**
 * Runs the birthday generator for every club in the database. Returns a summary.
 */
export async function generateAthleteBirthdayAlertsForAllClubs(now: Date = new Date()): Promise<{
  clubs: number;
  alertsCreated: number;
  recipientsCreated: number;
}> {
  const clubs = await prisma.club.findMany({ select: { id: true } });
  let alertsCreated = 0;
  let recipientsCreated = 0;

  for (const club of clubs) {
    try {
      const r = await generateAthleteBirthdayAlertsForClub(club.id, now);
      alertsCreated += r.alertsCreated;
      recipientsCreated += r.recipientsCreated;
    } catch (err) {
      log.error(`[alerts] Failed to generate birthday alerts for club ${club.id}:`, err);
    }
  }

  return { clubs: clubs.length, alertsCreated, recipientsCreated };
}
