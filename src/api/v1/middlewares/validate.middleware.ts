import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as any;

      // Update request with validated data
      if (validatedData.body) req.body = validatedData.body;

      if (validatedData.query) {
        Object.defineProperty(req, "query", {
          value: validatedData.query,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }

      if (validatedData.params) {
        Object.defineProperty(req, "params", {
          value: validatedData.params,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        });
      }
      next(error);
    }
  };
};
