import { z } from "zod";

const IntervalEnum = z.enum(["day", "week", "month", "year"]);

const planValidationSchema = z.object({
  body: z.object({
    planName: z
      .string({
        required_error: "Plan name is required",
        invalid_type_error: "Plan name must be a string",
      })
      .min(1, "Plan name is required"),

    description: z
      .string({
        invalid_type_error: "Description must be a string",
      })
      .max(500)
      .optional(),

    amount: z
      .number({
        required_error: "Amount is required",
        invalid_type_error: "Amount must be a number",
      })
      .min(0, "Amount must be positive"),

    currency: z
      .string({
        required_error: "Currency is required",
        invalid_type_error: "Currency must be a string",
      })
      .length(3, "Currency must be 3-letter code"),

    interval: IntervalEnum.default("month"),

    intervalCount: z
      .number({
        required_error: "Interval count is required",
        invalid_type_error: "Interval count must be a number",
      })
      .int()
      .positive("Interval count must be positive"),

    freeTrialDays: z
      .number({
        invalid_type_error: "Free trial days must be a number",
      })
      .int()
      .nonnegative()
      .optional()
      .default(0),

    active: z
      .boolean({
        invalid_type_error: "Active must be a boolean",
      })
      .default(true)
      .optional(),
  }),
});

export const PlanValidation = {
  planValidationSchema,
};
