import axios from 'axios';

axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const noResponse = !error.response; // request never reached the server (server/DB down)
    const serverError = error.response && error.response.status >= 500;

    if (noResponse || serverError) {
      window.dispatchEvent(new Event('server-unavailable'));
    }

    return Promise.reject(error);
  }
);

export default axios;
