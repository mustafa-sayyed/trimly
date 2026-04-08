import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodError, ZodTypeAny } from "zod";

type ValidationSchemas = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

const formatErrors = (error: ZodError) =>
  error.issues.map((issue) => ({
    field:
      issue.path.length > 0
        ? issue.path.map((segment) => String(segment)).join(".")
        : "request",
    message: issue.message,
  }));

const validateAgainstSchema = (
  schema: ZodTypeAny | undefined,
  input: unknown,
) => {
  if (!schema) {
    return { success: true as const, data: input };
  }

  return schema.safeParse(input);
};

export const validateRequest = (schemas: ValidationSchemas): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const bodyResult = validateAgainstSchema(schemas.body, req.body);
    const paramsResult = validateAgainstSchema(schemas.params, req.params);
    const queryResult = validateAgainstSchema(schemas.query, req.query);

    const errors: Array<{ field: string; message: string }> = [];

    if (!bodyResult.success) {
      errors.push(...formatErrors(bodyResult.error));
    }

    if (!paramsResult.success) {
      errors.push(...formatErrors(paramsResult.error));
    }

    if (!queryResult.success) {
      errors.push(...formatErrors(queryResult.error));
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    if (bodyResult.success && schemas.body) {
      req.body = bodyResult.data as Request["body"];
    }

    if (paramsResult.success && schemas.params) {
      req.params = paramsResult.data as Request["params"];
    }

    if (queryResult.success && schemas.query) {
      req.query = queryResult.data as Request["query"];
    }

    next();
  };
};
