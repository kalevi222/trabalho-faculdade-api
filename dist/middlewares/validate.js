"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (targets) => {
    return async (req, res, next) => {
        try {
            if (targets.body) {
                req.body = await targets.body.parseAsync(req.body);
            }
            if (targets.params) {
                const parsedParams = await targets.params.parseAsync(req.params);
                req.params = parsedParams;
            }
            if (targets.query) {
                const parsedQuery = await targets.query.parseAsync(req.query);
                req.query = parsedQuery;
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
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
exports.validate = validate;
