export const errorHandler = (err, req, res, _next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, err.message);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message;

  res.status(statusCode).json({ message });
};
