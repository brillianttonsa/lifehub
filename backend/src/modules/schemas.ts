import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required').max(200),
  description: z.string().trim().max(500).optional().default(''),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required').max(200),
  description: z.string().trim().max(500).optional().default(''),
});

export const createEntrySchema = z.object({
  content: z.string().trim().min(1, 'Entry cannot be empty').max(10000),
  entryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'entryDate must be YYYY-MM-DD'),
  commentsEnabled: z.boolean().optional().default(true),
});

export const updateEntrySchema = z.object({
  content: z.string().trim().min(1, 'Entry cannot be empty').max(10000),
  entryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'entryDate must be YYYY-MM-DD'),
  commentsEnabled: z.boolean().optional().default(true),
});

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(2000),
});

const planTimeframeSchema = z.enum([
  'Yearly',
  'Half-Yearly',
  'Quarterly',
  'Monthly',
  'Weekly',
  'Custom Range',
]);

const planPrioritySchema = z.enum(['Low', 'Medium', 'High']);
const planStatusSchema = z.enum(['Draft', 'Active', 'Completed', 'Archived', 'Cancelled']);
const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const createPlanSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().max(1000).optional().default(''),
    timeframe: planTimeframeSchema,
    startDate: dateStringSchema,
    endDate: dateStringSchema,
    priority: planPrioritySchema.optional().default('Medium'),
    status: planStatusSchema.optional().default('Active'),
    progress: z.number().min(0).max(100).optional().default(0),
    notes: z.string().trim().max(5000).optional().default(''),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    path: ['endDate'],
    message: 'End Date cannot be before Start Date',
  });

export const updatePlanSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200).optional(),
    description: z.string().trim().max(1000).optional(),
    timeframe: planTimeframeSchema.optional(),
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),
    priority: planPrioritySchema.optional(),
    status: planStatusSchema.optional(),
    progress: z.number().min(0).max(100).optional(),
    notes: z.string().trim().max(5000).optional(),
  })
  .refine(
    (data) =>
      !data.startDate ||
      !data.endDate ||
      new Date(data.endDate) >= new Date(data.startDate),
    {
      path: ['endDate'],
      message: 'End Date cannot be before Start Date',
    },
  );

export const updatePlanProgressSchema = z.object({
  progress: z.number().min(0, 'Progress must be at least 0').max(100, 'Progress cannot exceed 100'),
});

const roleSchema = z.enum(['contributor', 'viewer_comment', 'viewer']);

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  role: roleSchema,
});

export const updateMemberSchema = z.object({
  role: roleSchema,
});
