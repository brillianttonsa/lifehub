import { z } from 'zod';

export const createActivitySchema = z.object({
  name: z
    .string()
    .min(1, 'Activity name is required')
    .max(15, 'Max 15 characters')
    .regex(/^[a-zA-Z]+$/, 'Only letters allowed'),
});
