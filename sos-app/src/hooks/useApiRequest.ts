import { useCallback, useState } from 'react';
import { ApiError, toApiError } from '../api/errors';

type UseApiRequestState = {
  isLoading: boolean;
  error: ApiError | null;
};

type UseApiRequestOptions = {
  onError?: (error: ApiError) => void;
  onSuccess?: () => void;
};

export const useApiRequest = () => {
  const [state, setState] = useState<UseApiRequestState>({
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async <T>(
      requestFactory: () => Promise<T>,
      options?: UseApiRequestOptions
    ): Promise<T | null> => {
      setState({ isLoading: true, error: null });
      try {
        const data = await requestFactory();
        setState({ isLoading: false, error: null });
        options?.onSuccess?.();
        return data;
      } catch (error) {
        const normalized = toApiError(error);
        setState({ isLoading: false, error: normalized });
        options?.onError?.(normalized);
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null });
  }, []);

  return {
    isLoading: state.isLoading,
    error: state.error,
    execute,
    reset,
  };
};
