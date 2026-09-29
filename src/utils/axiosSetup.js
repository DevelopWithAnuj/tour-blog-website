import axios from 'axios';

axios.defaults.withCredentials = true;

let isRefreshing = false;
let queue = [];

const flushQueue = (error) => {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  queue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const noResponse = !error.response;
    const status = error.response?.status;
    const url = original?.url || '';
    const isAuthEndpoint = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh-token',
      '/auth/logout',
    ].some((p) => url.includes(p));
    const isHealthCheck = url.includes('/healthcheck');

    // refresh once for expired access tokens
    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        })
          .then(() => axios(original))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        await axios.post('/api/v1/auth/refresh-token');
        flushQueue(null);
        return axios(original);
      } catch (refreshError) {
        flushQueue(refreshError);
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // tis will remove after development
    if (isHealthCheck && (noResponse || status >= 500)) {
      window.dispatchEvent(new Event('server-unavailable'));
    }
    
    // this will turn on production
    // const serverError = status >= 500;
    // if (noResponse || (isHealthCheck && serverError)) {
    //   window.dispatchEvent(new Event('server-unavailable'));
    // }

    return Promise.reject(error);
  }
);

export default axios;
