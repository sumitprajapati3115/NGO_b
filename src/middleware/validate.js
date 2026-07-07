const validateBody = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (validationError) {
    const errors = validationError.details?.map((detail) => detail.message) || [validationError.message];
    res.status(400).json({ message: 'Validation failed.', errors });
  }
};

module.exports = {
  validateBody,
};
