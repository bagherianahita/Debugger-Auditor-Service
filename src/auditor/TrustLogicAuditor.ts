import { AuditResult, ScenarioDefinition, ScenarioResult, ScoringInput, ScoringResult } from "../types";

export class TrustLogicAuditor {
  private scenarios: ScenarioDefinition[];

  constructor(scenarios: ScenarioDefinition[]) {
    this.scenarios = scenarios;
  }

  static fromRegistry(registry: ScenarioDefinition[]): TrustLogicAuditor {
    return new TrustLogicAuditor(registry);
  }

  evaluate(input: ScoringInput, result: ScoringResult): AuditResult {
    const scenarioResults: ScenarioResult[] = [];
    const contradictions: ScenarioResult[] = [];

    for (const scenario of this.scenarios) {
      const passed = scenario.condition(input, result);

      const sr: ScenarioResult = {
        scenarioId: scenario.id,
        name: scenario.name,
        passed,
        expectedOutcome: scenario.expectedOutcome,
        severity: scenario.severity,
        message: passed
          ? undefined
          : `Scenario ${scenario.id} (${scenario.name}) failed`,
      };

      scenarioResults.push(sr);

      if (!passed && scenario.severity === "contradiction") {
        contradictions.push(sr);
      }
    }

    return {
      scenarioResults,
      contradictions,
      summary: {
        passed: scenarioResults.filter((r) => r.passed).length,
        failed: scenarioResults.filter((r) => !r.passed).length,
        contradictions: contradictions.length,
      },
    };
  }
}