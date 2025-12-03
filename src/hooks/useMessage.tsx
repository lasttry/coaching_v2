import { useState, useCallback } from 'react';

/**
 * useMessage
 * Exemplo de hook para gerir mensagens temporárias (success / error)
 *
 * @param timeout Tempo em ms até desaparecer (default 5000)
 */
export function useMessage(timeout: number = 5000): {
  message: string | null;
  setTimedMessage: (msg: string | null) => void;
} {
  const [message, setMessage] = useState<string | null>(null);

  const setTimedMessage = useCallback(
    (msg: string | null) => {
      setMessage(msg);
      if (msg && timeout > 0) {
        const timer = setTimeout(() => setMessage(null), timeout);
        return () => clearTimeout(timer);
      }
    },
    [timeout]
  );

  return { message, setTimedMessage };
}
