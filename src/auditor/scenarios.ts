import { ScenarioDefinition } from "../types";

const scenario = (
  id: string,
  name: string,
  condition: ScenarioDefinition["condition"],
  expectedOutcome?: string,
  severity: ScenarioDefinition["severity"] = "info"
): ScenarioDefinition => ({
  id,
  name,
  condition,
  expectedOutcome,
  severity,
});

export const scenarios: ScenarioDefinition[] = [
  scenario(
    "S01",
    "Rent-to-income not critically high or flagged",
    (input, result) => {
      if (!input.monthlyIncome || !input.rentAmount) return true;
      const ratio = (input.rentAmount / input.monthlyIncome) * 100;

      if (ratio <= 60) {
        // below critical, always OK
        return true;
      }

      // If ratio > 60%, we expect some concern about affordability
      const concerns = result.fixedBreakdown?.concerns || [];
      const hasAffordabilityConcern = concerns.some((c) =>
        /rent-to-income|affordability|rent to income/i.test(c)
      );

      return hasAffordabilityConcern;
    },
    "flag_affordability",
    "contradiction"
  ),

  scenario(
    "S02",
    "Clean compliance checks should not produce low trust",
    (input, result) => {
      const {
        criminalBackground,
        sanctionsCheck,
        fraudCheck,
      } = input;

      const allClean =
        criminalBackground === false &&
        sanctionsCheck === false &&
        fraudCheck === false;

      if (!allClean) return true;

      // If everything is clean, we should not be at the lowest band
      const band =
        (result as any).trustBand ||
        (result as any).band ||
        (result as any).trust_level;

      if (!band) return true;

      const normalized = String(band).toLowerCase();
      const isVeryLow =
        ["poor", "high_risk", "high risk"].includes(normalized);

      return !isVeryLow;
    },
    "avoid_very_low_band_on_clean_checks",
    "warning"
  ),

  scenario(
    "S03",
    "Multiple missed payments should produce some concern",
    (input, result) => {
      const missed = input.missedPayments ?? 0;
      if (missed < 2) return true;

      const concerns = result.fixedBreakdown?.concerns || [];
      const mentionsPayments = concerns.some((c) =>
        /payment|late|missed/i.test(c)
      );

      return mentionsPayments;
    },
    "payment_history_should_be_flagged",
    "contradiction"
  ),

  scenario(
    "S04",
    "Low verification signals should not be labelled high_trust",
    (input, result) => {
      const methods = [
        input.oneIdVerified,
        input.phoneVerified,
        input.selfieVerified,
        input.documentIntegrityCheck,
      ];

      const countVerified = methods.filter((v) => v === true).length;

      const band =
        (result as any).trustBand ||
        (result as any).trust_level ||
        (result as any).band;
      if (!band) return true;

      const normalized = String(band).toLowerCase().trim();
      const isHighTrust =
        ["high_trust", "high trust", "excellent", "very_good", "good"].includes(
          normalized
        );

      if (!isHighTrust) return true;

      // If we're calling this "high trust", we expect at least 3 verification methods.
      return countVerified >= 3;
    },
    "require_strong_verification_for_high_trust",
    "warning"
  ),
];