import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

interface ValidationTargets {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export const validate = (targets: ValidationTargets) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (targets.body) {
        req.body = await targets.body.parseAsync(req.body);
      }
      if (targets.params) {
        const parsedParams = await targets.params.parseAsync(req.params);
        req.params = parsedParams as any;
      }
      if (targets.query) {
        const parsedQuery = await targets.query.parseAsync(req.query);
        req.query = parsedQuery as any;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Erro de validação nos dados fornecidos',
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }
      return res.status(500).json({ message: 'Erro interno do servidor na validação' });
    }
  };
};
