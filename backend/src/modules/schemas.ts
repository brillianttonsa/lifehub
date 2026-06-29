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

const roleSchema = z.enum(['contributor', 'viewer_comment', 'viewer']);

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  role: roleSchema,
});

export const updateMemberSchema = z.object({
  role: roleSchema,
});
