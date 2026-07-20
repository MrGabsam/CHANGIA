import { ZodError } from 'zod';

export function notFound(req, res) {
  res.status(404).json({ message: 'Resource not found.' });
}

export function errorHandler(error, req, res, next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Please correct the highlighted information.',
      issues: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({ message: 'A record with these details already exists.' });
  }

  console.error(error);
  const status = error.status || 500;
  return res.status(status).json({
    message: error.message || 'Unexpected server error.',
    ...(process.env.NODE_ENV !== 'production' ? { stack: error.stack } : {}),
  });
}
