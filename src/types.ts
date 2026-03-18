export type Pathway = "experienced_renter" | "first_time_renter" | "newcomer" | string;

export interface ScoringInput {
  pathway: Pathway;
  monthlyIncome?: number;
  rentAmount?: number;
  latePayments?: number;
  missedPayments?: number;
  currentTenancyLength?: number;
  addressVerificationStatus?: boolean;
  employmentStatus?: string | null;
  employmentVerified?: boolean;
  incomeVerified?: boolean;
  criminalBackground?: boolean;
  sanctionsCheck?: boolean;
  fraudCheck?: boolean;
  oneIdVerified?: boolean;
  phoneVerified?: boolean;
  selfieVerified?: boolean;
  documentIntegrityCheck?: boolean;
  totalIncome?: number;
  trainingCompleted?: boolean;
  studentStatus?: string | null;
  tenantPreferences?: Record<string, unknown>;
  listingDetails?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ScoringResult {
  totalScore: number;
  fixedScore: number;
  variableScore?: number | null;
  pathway: Pathway;
  thresholdMet?: boolean;
  fixedBreakdown?: {
    components?: Record<string, number>;
    strengths?: string[];
    concerns?: string[];
  };
  variableBreakdown?: Record<string, unknown> | null;
  warnings?: string[];
  missingData?: string[];
  [key: string]: unknown;
}

export type ScenarioSeverity = "info" | "warning" | "contradiction";

export interface ScenarioDefinition {
  id: string;
  name: string;
  description?: string;
  condition: (input: ScoringInput, result: ScoringResult) => boolean;
  expectedOutcome?: string;
  severity?: ScenarioSeverity;
}

export interface ScenarioResult {
  scenarioId: string;
  name: string;
  passed: boolean;
  expectedOutcome?: string;
  message?: string;
  severity?: ScenarioSeverity;
}

export interface AuditResult {
  scenarioResults: ScenarioResult[];
  contradictions: ScenarioResult[];
  summary: {
    passed: number;
    failed: number;
    contradictions: number;
  };
}