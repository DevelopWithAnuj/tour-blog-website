// Error middleware placeholder
export function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Page not found' });
}

export function errorHandler(err, req, res, next) {
  res.status(500).json({ message: err.message || 'Server error' });
}
