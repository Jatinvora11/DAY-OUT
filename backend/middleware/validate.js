import { validationResult } from 'express-validator';

/**
 * Central validation middleware.
 * Reads the result of express-validator chains and returns 400 if any errors exist.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};
