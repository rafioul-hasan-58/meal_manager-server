import { z } from "zod";

// ── addSingleMeal ─────────────────────────────────────────────────────────────
const addSingleMealSchema = z.object({
  userId: z.string({ required_error: "User ID is required" }),
  date: z.string({ required_error: "Date is required" }).refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  breakfast: z.number().min(0).max(1).default(0),
  lunch: z.number().min(0).max(1).default(0),
  dinner: z.number().min(0).max(1).default(0),
});

// ── addMultipleMeals ──────────────────────────────────────────────────────────
const addMultipleMealsSchema = z.object({
  entries: z
    .array(addSingleMealSchema)
    .min(1, { message: "At least one meal entry is required" }),
});

// ── updateMeal ────────────────────────────────────────────────────────────────
const updateMealSchema = z
  .object({
    breakfast: z.number().min(0).max(1).optional(),
    lunch: z.number().min(0).max(1).optional(),
    dinner: z.number().min(0).max(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field (breakfast, lunch, dinner) must be provided",
  });

// ── deleteManyMeals ───────────────────────────────────────────────────────────
const deleteManyMealsSchema = z.object({
  ids: z
    .array(z.string({ required_error: "Each ID must be a string" }))
    .min(1, { message: "At least one ID is required" }),
});

// ── getMeals (query filters) ──────────────────────────────────────────────────
const getMealsQuerySchema = z.object({
  userId: z.string().optional(),
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: "Invalid startDate" }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: "Invalid endDate" }),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
});

export const MealValidation = {
  addSingleMealSchema,
  addMultipleMealsSchema,
  updateMealSchema,
  deleteManyMealsSchema,
  getMealsQuerySchema,
};