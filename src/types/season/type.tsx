export interface SeasonInterface {
  id: number | null;
  name: string; // Ex: "2025/2026"
  startDate: string; // ISO string
  endDate: string; // ISO string
  isCurrent: boolean;
}
