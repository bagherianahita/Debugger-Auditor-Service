import { Request, Response } from "express";
import { z } from "zod";
import { TrustLogicAuditor } from "../auditor/TrustLogicAuditor";
import { scenarios } from "../auditor/scenarios";
import { ScoringInput, ScoringResult } from "../types";

const scoringInputSchema: z.ZodType<ScoringInput> = z.object({
  pathway: z.string(),
  monthlyIncome: z.coerce.number().optional(),
  rentAmount: z.coerce.number().optional(),
  latePayments: z.coerce.number().optional(),
  missedPayments: z.coerce.number().optional(),
  currentTenancyLength: z.coerce.number().optional(),
  addressVerificationStatus: z.boolean().optional(),
  employmentStatus: z.string().nullable().optional(),
  employmentVerified: z.boolean().optional(),
  incomeVerified: z.boolean().optional(),
  criminalBackground: z.boolean().optional(),
  sanctionsCheck: z.boolean().optional(),
  fraudCheck: z.boolean().optional(),
  oneIdVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
  selfieVerified: z.boolean().optional(),
  documentIntegrityCheck: z.boolean().optional(),
  totalIncome: z.coerce.number().optional(),
  trainingCompleted: z.boolean().optional(),
  studentStatus: z.string().nullable().optional(),
  tenantPreferences: z.record(z.any()).optional(),
  listingDetails: z.record(z.any()).optional(),
})
  // allow unknown extra keys
  .catchall(z.any());

const scoringResultSchema: z.ZodType<ScoringResult> = z
  .object({
    totalScore: z.number(),
    fixedScore: z.number(),
    variableScore: z.number().nullable().optional(),
    pathway: z.string(),
    thresholdMet: z.boolean().optional(),
    fixedBreakdown: z
      .object({
        components: z.record(z.number()).optional(),
        strengths: z.array(z.string()).optional(),
        concerns: z.array(z.string()).optional(),
      })
      .optional(),
    variableBreakdown: z.record(z.any()).nullable().optional(),
    warnings: z.array(z.string()).optional(),
    missingData: z.array(z.string()).optional(),
  })
  .catchall(z.any());

const singleAuditRequestSchema = z.object({
  scoringInput: scoringInputSchema,
  scoringResult: scoringResultSchema,
});

const batchAuditRequestSchema = z.object({
  cases: z.array(
    z.object({
      id: z.string(),
      scoringInput: scoringInputSchema,
      scoringResult: scoringResultSchema,
    })
  ),
});

const auditor = TrustLogicAuditor.fromRegistry(scenarios);

export const runSingleAudit = (req: Request, res: Response) => {
  const parsed = singleAuditRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid payload",
      errors: parsed.error.issues,
    });
  }

  const { scoringInput, scoringResult } = parsed.data;
  const auditResult = auditor.evaluate(scoringInput, scoringResult);

  return res.status(200).json({
    message: "Audit completed",
    data: {
      scoringInput,
      scoringResult,
      audit: auditResult,
    },
  });
};

export const runBatchAudit = (req: Request, res: Response) => {
  const parsed = batchAuditRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid payload",
      errors: parsed.error.issues,
    });
  }

  const { cases } = parsed.data;
  const results = cases.map((c) => {
    const audit = auditor.evaluate(c.scoringInput, c.scoringResult);
    return {
      id: c.id,
      audit,
    };
  });

  return res.status(200).json({
    message: "Batch audit completed",
    data: results,
  });
};