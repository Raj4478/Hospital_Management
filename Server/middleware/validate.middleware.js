import { ApiError } from "../utils/ApiError.js";

/**
 * Validates req[source] against a zod schema and replaces it with the parsed value,
 * so controllers only ever see clean, typed input.
 */
export const validate = (schema, source = "body") => (req, _res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
        const errors = result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
        return next(ApiError.badRequest(errors[0]?.field ? `${errors[0].field}: ${errors[0].message}` : "Invalid request", errors));
    }
    if (source === "query") {
        // req.query is a getter in Express 5-style setups; mutate rather than reassign.
        Object.assign(req.query, result.data);
    } else {
        req[source] = result.data;
    }
    next();
};
