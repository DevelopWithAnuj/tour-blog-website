const requestLogger = {
  logFetch: (url, startTime) => {
    const responseTime = Date.now() - startTime;
    console.info('Frontend request', {
      url,
      responseTime: `${responseTime}ms`,
    });
  },
};

export default requestLogger;
