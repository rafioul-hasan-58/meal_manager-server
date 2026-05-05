import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType, ZodTypeAny } from "zod";

const validateRequest =
  (schema: ZodTypeAny) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync(req.body);
        return next();
      } catch (err) {
        if (err instanceof ZodError) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: err.errors.map((error) => ({
              path: error.path.join("."),
              message: error.message,
            })),
          });
        }
        return next(err);
      }
    };

export const validateRequestArray =
  (schema: ZodType) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync(req.body);
        return next();
      } catch (err) {
        next(err);
      }
    };

export default validateRequest;
