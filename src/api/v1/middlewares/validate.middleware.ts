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
        // Mutate existing query object to bypass Express 5 read-only getter
        Object.keys(req.query).forEach((key) => delete (req.query as any)[key]);
        Object.assign(req.query, validatedData.query);
      }
      if (validatedData.params) {
        // Mutate existing params object to bypass Express 5 read-only getter
        Object.keys(req.params).forEach((key) => delete (req.params as any)[key]);
        Object.assign(req.params, validatedData.params);
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
