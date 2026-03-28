import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useMessage
 * Hook for managing temporary messages (success / error) with proper cleanup
 *
 * @param timeout Time in ms until message disappears (default 5000)
 */
export function useMessage(timeout: number = 5000): {
  message: string | null;
  setTimedMessage: (msg: string | null) => void;
  setMessage: (msg: string | null) => void;
} {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const setTimedMessage = useCallback(
    (msg: string | null) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setMessage(msg);
      if (msg && timeout > 0) {
        timerRef.current = setTimeout(() => setMessage(null), timeout);
      }
    },
    [timeout]
  );

  return { message, setTimedMessage, setMessage };
}
