import { useState, useCallback } from 'react';
import { useAuth } from '../store/AuthContext';
import { useApiRequest } from '../hooks/useApiRequest';

export const useAuthViewModel = () => {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [error, setError] = useState<string | null>(null);
  const { execute, isLoading } = useApiRequest();

  const isValid = phone.length === 10;

  const handleLogin = useCallback(async () => {
    if (!isValid) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    setError(null);

    const result = await execute(
      async () => {
        const normalizedPhone = `${countryCode}${phone}`.replace(/\s+/g, '');
        return login(normalizedPhone);
      },
      {
        onError: (requestError) => {
          setError(requestError.message || 'Failed to send OTP. Please try again.');
        },
      }
    );
    return result;
  }, [phone, countryCode, isValid, login, execute]);

  return {
    phone,
    countryCode,
    isValid,
    isLoading,
    error,
    setPhone,
    setCountryCode,
    handleLogin,
    clearError: () => setError(null),
  };
};
