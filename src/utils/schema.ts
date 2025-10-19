// src/utils/schema.ts
import { z } from 'zod'

export const RegionEffectSchema = z.object({
  powerIncrement: z.number().optional(),
  controlIncrement: z.number().optional(),
  stabilityIncrement: z.number().optional(),
})

export const ConsequenceMapSchema = z.object({
  regionEffects: z.record(RegionEffectSchema),
})

export const NextMoveSchema = z.object({
  headline: z.string(),
  effects: z.record(RegionEffectSchema),
})

export const OptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  cost: z.number(),
  previewRisk: z.enum(['Low', 'Moderate', 'High']),
  consequences: ConsequenceMapSchema,
  nextMove: NextMoveSchema,
})

export const NewsEventSchema = z.object({
  id: z.string(),
  headline: z.string(),
  summary: z.string(),
  region: z.string(),
  options: z.array(OptionSchema),
  skipOption: z.boolean(),
})

export const LLMResponseSchema = z.object({
  newsEvents: z.array(NewsEventSchema),
})
