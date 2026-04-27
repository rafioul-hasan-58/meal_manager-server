import { z } from "zod";

const SubscriptionValidationSchema = z.object({
  body: z.object({
    planId: z.string({
      required_error: "Plan ID is required",
      invalid_type_error: "Plan ID must be a string",
    }),
  }),
});

export const SubscriptionValidation = {
  SubscriptionValidationSchema,
};
