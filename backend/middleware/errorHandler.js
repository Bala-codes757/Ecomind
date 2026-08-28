// Global Backend Error Handler Middleware
export function errorHandler(err, req, res, next) {
  console.error('[EcoMind API Error]:', err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : (err.status || 500);

  res.status(statusCode).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
}

export default errorHandler;
