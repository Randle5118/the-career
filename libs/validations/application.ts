/**
 * Application 相關的 Zod 驗證 Schema
 * 
 * 用於 API routes 的輸入驗證
 */

import { z } from "zod";

// ============================================
// 基本型別 Schema
// ============================================

export const ApplicationStatusSchema = z.enum([
  "bookmarked",
  "applied",
  "interview",
  "offer",
  "rejected",
]);

export const EmploymentTypeSchema = z.enum([
  "full_time",
  "contract",
  "temporary",
  "part_time",
  "freelance",
  "side_job",
  "dispatch",
]);

// ============================================
// Application Method Schemas
// ============================================

export const JobSiteMethodSchema = z.object({
  type: z.literal("job_site"),
  siteName: z.string().max(100),
  siteUrl: z.string().url().max(500),
  scoutType: z.enum(["direct", "recruiter"]).optional(),
  recruiterName: z.string().max(100).optional(),
  recruiterCompany: z.string().max(100).optional(),
  scoutName: z.string().max(100).optional(),
  scoutCompany: z.string().max(100).optional(),
  scoutEmail: z.string().email().max(100).optional(),
  memo: z.string().max(1000).optional(),
});

export const ReferralMethodSchema = z.object({
  type: z.literal("referral"),
  referrerName: z.string().max(100),
  personFrom: z.string().max(100),
  referrerEmail: z.string().email().max(100).optional(),
  siteUrl: z.string().url().max(500).optional(),
  memo: z.string().max(1000).optional(),
});

export const DirectMethodSchema = z.object({
  type: z.literal("direct"),
  siteUrl: z.string().url().max(500),
  contactPerson: z.string().max(100),
  contactEmail: z.string().email().max(100).optional(),
  memo: z.string().max(1000).optional(),
});

export const ApplicationMethodSchema = z.discriminatedUnion("type", [
  JobSiteMethodSchema,
  ReferralMethodSchema,
  DirectMethodSchema,
]);

// ============================================
// Salary Schemas
// ============================================

export const SalaryDetailsSchema = z.object({
  minAnnualSalary: z.number().int().min(0).max(10000).optional(), // 万円
  maxAnnualSalary: z.number().int().min(0).max(10000).optional(), // 万円
  notes: z.string().max(500).optional(),
});

export const SalaryBreakdownSchema = z.object({
  salary: z.number().int().min(0), // k (1k = 1,000)
  salaryType: z.string().max(100),
});

export const OfferSalaryDetailsSchema = z.object({
  currency: z.string().max(10).optional(),
  salaryBreakdown: z.array(SalaryBreakdownSchema).max(20).optional(),
  notes: z.string().max(500).optional(),
});

// ============================================
// Interview Method Schemas
// ============================================

export const InPersonInterviewSchema = z.object({
  type: z.literal("in_person"),
  address: z.string().max(500),
  notes: z.string().max(500).optional(),
});

export const OnlineInterviewSchema = z.object({
  type: z.literal("online"),
  url: z.string().url().max(500),
});

export const InterviewMethodSchema = z.discriminatedUnion("type", [
  InPersonInterviewSchema,
  OnlineInterviewSchema,
]);

// ============================================
// Schedule Schema
// ============================================

export const ScheduleSchema = z.object({
  nextEvent: z.string().max(200).optional(),
  deadline: z.string().datetime().optional(),
  interviewMethod: InterviewMethodSchema.optional(),
});

// ============================================
// Application Form Data Schema
// ============================================

export const ApplicationFormDataSchema = z.object({
  companyName: z.string().min(1).max(100),
  companyUrl: z.string().url().max(500).optional().or(z.literal("")),
  position: z.string().min(1).max(100),
  status: ApplicationStatusSchema,
  employmentType: EmploymentTypeSchema.optional(),
  applicationMethod: ApplicationMethodSchema,
  jobDescriptionFile: z.string().max(1000).optional().or(z.literal("")),
  offerFile: z.string().max(1000).optional().or(z.literal("")),
  postedSalary: SalaryDetailsSchema.optional(),
  desiredSalary: z.union([
    z.string().regex(/^\d+$/, "必須為數字").transform((val) => parseInt(val, 10)),
    z.number().int().min(0).max(10000),
  ]).optional(),
  offerSalary: OfferSalaryDetailsSchema.optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  notes: z.string().max(5000).optional(),
  schedule: ScheduleSchema.optional(),
}).strict(); // 禁止額外欄位

// ============================================
// Type Exports
// ============================================

export type ApplicationFormData = z.infer<typeof ApplicationFormDataSchema>;

