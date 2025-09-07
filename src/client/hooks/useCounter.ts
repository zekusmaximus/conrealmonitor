import { useCallback, useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import type { InitResponse, IncrementResponse, DecrementResponse } from '../../shared/types/api';

interface CounterState {
  count: number;
  username: string | null;
  loading: boolean;
  error: string | null;
}

export const useCounter = () => {
  const [state, setState] = useState<CounterState>({
    count: 0,
    username: null,
    loading: true,
    error: null,
  });
  const [postId, setPostId] = useState<string | null>(null);
  const debounceTimeout = useRef<any>(null);

  // fetch initial data with retry logic
  useEffect(() => {
    const init = async () => {
      let retries = 0;
      const maxRetries = 3;
      const baseDelay = 1000; // 1 second

      while (retries <= maxRetries) {
        try {
          const res = await fetch('/api/init');
          if (!res.ok) {
            if (res.status === 429 || res.status === 400) {
              if (retries < maxRetries) {
                const delay = baseDelay * Math.pow(2, retries);
                console.warn(`Init failed with ${res.status}, retrying in ${delay}ms (attempt ${retries + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                retries++;
                continue;
              }
            }
            throw new Error(`HTTP ${res.status}`);
          }
          const data: InitResponse = await res.json();
          if (data.type !== 'init') throw new Error('Unexpected response');
          setState({ count: data.count, username: data.username, loading: false, error: null });
          setPostId(data.postId);
          return; // Success, exit
        } catch (err) {
          if (retries >= maxRetries) {
            console.error('Failed to init counter after retries', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to init counter';
            setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
            toast.error(errorMessage);
            return;
          }
          retries++;
        }
      }
    };
    void init();
  }, []);

  const update = useCallback(
    async (action: 'increment' | 'decrement') => {
      if (!postId) {
        console.error('No postId – cannot update counter');
        return;
      }
      let retries = 0;
      const maxRetries = 3;
      const baseDelay = 1000; // 1 second

      while (retries <= maxRetries) {
        try {
          const res = await fetch(`/api/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });
          if (!res.ok) {
            if (res.status === 429 || res.status === 400) {
              if (retries < maxRetries) {
                const delay = baseDelay * Math.pow(2, retries);
                console.warn(`${action} failed with ${res.status}, retrying in ${delay}ms (attempt ${retries + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                retries++;
                continue;
              }
            }
            throw new Error(`HTTP ${res.status}`);
          }
          const data: IncrementResponse | DecrementResponse = await res.json();
          setState((prev) => ({ ...prev, count: data.count, error: null }));
          return; // Success, exit
        } catch (err) {
          if (retries >= maxRetries) {
            console.error(`Failed to ${action} after retries`, err);
            const errorMessage = err instanceof Error ? err.message : `Failed to ${action}`;
            setState((prev) => ({ ...prev, error: errorMessage }));
            toast.error(errorMessage);
            return;
          }
          retries++;
        }
      }
    },
    [postId]
  );

  const increment = useCallback(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => update('increment'), 500);
  }, [update]);
  const decrement = useCallback(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => update('decrement'), 500);
  }, [update]);

  return {
    ...state,
    increment,
    decrement,
  } as const;
};
