const SENSITIVE_PREFIXES = [
  '/reset-password/',
  '/verify-email/',
  '/inquiry-tracker/',
  '/contact/track/',
  '/unsubscribe/',
];

export const redactPath = (rawPath = '') => {
  for (const prefix of SENSITIVE_PREFIXES) {
    const i = rawPath.indexOf(prefix);
    if (i !== -1) return rawPath.slice(0, i + prefix.length) + '[redacted]';
  }
  return rawPath
};

export const redactUrl = (url = '') => {
    const q = url.indexOf('?')
    return q === -1 ? redactPath(url) : `${redactPath(url.slice(0,q))}${url.slice(q)}`
}
