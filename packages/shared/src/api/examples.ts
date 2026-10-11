import { z } from 'zod';

export const createExampleInputSchema = z.object({
   name: z.string().min(1).max(120),
});

export type CreateExampleInput = z.infer<typeof createExampleInputSchema>;

export const exampleSchema = z.object({
   id: z.string(),
   name: z.string(),
   createdAt: z.string(),
});

export type Example = z.infer<typeof exampleSchema>;
