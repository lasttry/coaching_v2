import { useState } from 'react';

export const useMessage = (
  timeout = 5000
): {
  message: string | null;
  setTimedMessage: React.Dispatch<React.SetStateAction<string | null>>;
} => {
  const [message, setMessage] = useState<string | null>(null);

  const setTimedMessage: React.Dispatch<React.SetStateAction<string | null>> = (newMessage) => {
    setMessage(newMessage);
    setTimeout(() => setMessage(null), timeout);
  };

  return { message, setTimedMessage };
};
