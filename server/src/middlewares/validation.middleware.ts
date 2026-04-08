import type { NextFunction, Request, RequestHandler, Response } from "express";
import { flattenError, type ZodError, type ZodType } from "zod";

type ValidationSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

const formatErrors = (error: ZodError) => {
  console.log(error);

  return flattenError(error).fieldErrors;
};

const validateAgainstSchema = (schema: ZodType | undefined, input: unknown) => {
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

    const errors = [];

    if (!bodyResult.success) {
      errors.push(formatErrors(bodyResult.error));
    }

    if (!paramsResult.success) {
      errors.push(formatErrors(paramsResult.error));
    }

    if (!queryResult.success) {
      errors.push(formatErrors(queryResult.error));
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        name: "ValidationError",
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
