const getTimestamp = () => new Date().toISOString();

const logWithLevel = (level, message, meta = {}) => {
  const payload = {
    timestamp: getTimestamp(),
    level,
    message,
    ...(Object.keys(meta).length ? { meta } : {}),
  };

  const value = Object.keys(meta).length ? payload : message;

  if (console && typeof console[level] === 'function') {
    console[level](value);
  } else {
    console.log(value);
  }
};

const logger = {
  info: (message, meta) => logWithLevel('info', message, meta),
  warn: (message, meta) => logWithLevel('warn', message, meta),
  error: (message, meta) => logWithLevel('error', message, meta),
  debug: (message, meta) => logWithLevel('debug', message, meta),
};

export default logger;
