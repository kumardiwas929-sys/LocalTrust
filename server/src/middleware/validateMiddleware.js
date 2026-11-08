export const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (err) {
    if (err.errors) {
      return res.status(400).json({
        success: false,
        message: err.errors[0]?.message || 'Validation error',
        errors: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    return res.status(400).json({ success: false, message: 'Invalid request data' });
  }
};
