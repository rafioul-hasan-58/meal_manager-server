import { z } from "zod";

const updateUserValidationSchema = z.object({
  fullName: z
    .string({
      invalid_type_error: "Full name must be a string.",
    })
    .optional(),

});

export const createAccountSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Full name must be at least 3 characters")
      .max(50, "Full name too long"),

    email: z
      .string()
      .email("Invalid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[0-9]/, "Must contain at least one number"),
    phone: z
      .string()
      .optional()
      .or(z.literal("")),
  })

export const matchDetailsSchema = z.object({
  matchName: z
    .string()
    .min(3, "Match name must be at least 3 characters")
    .max(100, "Match name too long"),

  matchAddress: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address too long")
    .optional()
    .or(z.literal("")),

  matchDescription: z
    .string()
    .max(500, "Description too long")
    .optional()
    .or(z.literal("")),

  approxTotalMembers: z
    .number({ invalid_type_error: "Must be a number" })
    .min(1, "At least 1 member required")
    .max(500, "Too many members"),
});

// ── Full schema (all steps combined for final submit)
export const registerSchema = createAccountSchema
  .and(matchDetailsSchema);
// ── Types inferred from schemas
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type MatchDetailsInput = z.infer<typeof matchDetailsSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const UserValidation = {
  updateUserValidationSchema,
  registerSchema
};
