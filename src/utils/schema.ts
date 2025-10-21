// src/utils/schema.ts
import { z } from 'zod'

export const RegionEffectSchema = z
  .object({
    powerIncrement: z.number().optional(),
    controlIncrement: z.number().optional(),
    stabilityIncrement: z.number().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one effect must be specified',
  })

export const ConsequenceMapSchema = z
  .object({
    regionEffects: z.record(RegionEffectSchema),
  })
  .refine((data) => Object.keys(data.regionEffects).length > 0, {
    message: 'At least one region effect must be specified',
  })

export const NextMoveSchema = z.object({
  headline: z.string(),
  effects: z.record(RegionEffectSchema),
})

export const OptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  cost: z.number().min(5).max(20),
  previewRisk: z.enum(['Low', 'Moderate', 'High']),
  consequences: ConsequenceMapSchema,
  nextMove: NextMoveSchema.optional(),
})

export const NewsEventSchema = z.object({
  id: z.string(),
  headline: z.string().min(10).max(80),
  summary: z.string().min(50).max(150),
  region: z.string(),
  options: z.array(OptionSchema).min(1).max(3),
  skipOption: z.boolean(),
})

// More lenient schema for LLM response validation
export const LLMResponseSchema = z.object({
  newsEvents: z.array(
    z.object({
      id: z.string().optional(),
      headline: z.string().optional(),
      summary: z.string().optional(),
      region: z.string().optional(),
      options: z
        .array(
          z.object({
            id: z.string().optional(),
            label: z.string().optional(),
            cost: z.number().optional(),
            previewRisk: z.enum(['Low', 'Moderate', 'High']).optional(),
            consequences: z
              .object({
                regionEffects: z.record(RegionEffectSchema).optional(),
              })
              .optional(),
            nextMove: z
              .object({
                headline: z.string().optional(),
                effects: z.record(RegionEffectSchema).optional(),
              })
              .optional(),
          }),
        )
        .optional(),
      skipOption: z.boolean().optional(),
    }),
  ),
})
