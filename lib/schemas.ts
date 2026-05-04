import { z } from "zod";

export const LoginSchema = z.object({ userId: z.string().min(1) });
export const CreateConversationSchema = z.object({ productInstanceId: z.string().min(1), title: z.string().optional() });
export const SendMessageSchema = z.object({ conversationId: z.string().min(1), content: z.string().min(1).max(4000) });
export const ToggleIntegrationSchema = z.object({ integration: z.enum(["shopify", "crm"]), enabled: z.boolean() });

export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type ToggleIntegrationInput = z.infer<typeof ToggleIntegrationSchema>;
