import { z } from "zod";

export const SocialSchema = z.object({
  id: z.number(),
  social_id: z.number(),
  social_channel_id: z.number(),
  value: z.string(),
});

export type Social = z.infer<typeof SocialSchema>;