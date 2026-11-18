// src/types/metrics.ts
export interface MonthlyMetricSeriesPoint {
  month: string; // e.g. "Dec 25", "Jan 26"
  compliancePercent: number;
  exceptionCount: number;
  mttdHours: number;
  mttrHours: number;
  criticalIncidents: number;
  highIncidents: number;
  mediumIncidents: number;
  lowIncidents: number;
  reportsOnTime: number;
  reportsLate: number;
  reportsAcknowledged: number;
  aiAcceptanceRate: number;
  dataFreshnessScore: number;
  accessAnomalyCount: number;
  evidenceCoveragePercent: number;
}
