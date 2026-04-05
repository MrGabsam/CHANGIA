export function notFound(req, res) {
  res.status(404).json({ message: 'Resource not found.' });
}

export function errorHandler(error, req, res, next) {
  console.error(error);
  const status = error.status || 500;
  res.status(status).json({
    message: error.message || 'Unexpected server error.',
    ...(process.env.NODE_ENV !== 'production' ? { stack: error.stack } : {}),
  });
}
