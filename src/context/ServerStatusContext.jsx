import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import axios from 'axios';

const ServerStatusContext = createContext(null);
const HEALTH_CHECK_TIMEOUT_MS = 15_000;
const RECHECK_WHEN_DOWN_MS = 20_000;

export function ServerStatusProvider({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'up' | 'down'
  const [retrying, setRetrying] = useState(false)
  const inFlight = useRef(null);

  const checkServerHealth = useCallback( () => {
    if (inFlight.current) {
      return inFlight.current;
    }

    setRetrying(true)

    inFlight.current = axios
      .get('/api/v1/healthcheck', { timeout: HEALTH_CHECK_TIMEOUT_MS })
      .then(() => setStatus('up'))
      .catch(() => setStatus('down'))
      .finally(() => {
        inFlight.current = null;
        setRetrying(false)
      });

    return inFlight.current;
  }, []);

  useEffect(() => {
    checkServerHealth();
  }, [checkServerHealth]);

  //while down
  useEffect(() => {
    if(status !== 'down') return
    const id = setInterval(checkServerHealth, RECHECK_WHEN_DOWN_MS)
    return () => clearInterval(id)
  }, [status, checkServerHealth])

  return (
    <ServerStatusContext.Provider value={{ status, retry: checkServerHealth }}>
      {children}
    </ServerStatusContext.Provider>
  );
}

export function useServerStatus() {
  const ctx = useContext(ServerStatusContext);
  if (!ctx) {
    throw new Error('useServerStatus must be used within ServerStatusProvider');
  }
  return ctx;
}
