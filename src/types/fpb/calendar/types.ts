/**
 * Represents a single upcoming game scraped from an FPB team calendar page
 * (`https://www.fpb.pt/equipa/equipa_<fpbTeamId>/`, section "Calendário").
 *
 * All fields come from the FPB site verbatim (after trimming). Interpretation
 * of home/away and mapping to our domain entities (Opponent, Competition,
 * Venue) is done downstream in the import pipeline.
 */
export interface FpbCalendarGame {
  /** Raw date string as displayed on the site (e.g. "25 ABR 2026"). */
  dateText: string;

  /** Parsed Date in Europe/Lisbon local time, or null if parsing failed. */
  date: Date | null;

  /** Raw time string (e.g. "18H30" or "14H15"). */
  timeText: string;

  /** Home team full name. */
  homeTeamName: string;

  /** Away team full name. */
  awayTeamName: string;

  /** Venue / location name. */
  venueName: string;

  /** Echelon label from FPB (e.g. "Sub 18 Masculino"). */
  echelonLabel: string | null;

  /** Competition label (e.g. "Taça Nacional Sub18 Masculinos"). */
  competitionLabel: string | null;

  /**
   * FPB internal game id (the `internalID` query string on the ficha de jogo link).
   * Used as the canonical identifier for deduplication on import.
   */
  fpbGameId: number | null;

  /** Full URL of the ficha de jogo, or null if not available. */
  detailUrl: string | null;
}
