import { useState, useCallback } from 'react';
import { useAuth } from '../store/AuthContext';

export const useAuthViewModel = () => {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = phone.length === 10;

  const handleLogin = useCallback(async () => {
    if (!isValid) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(`${countryCode}${phone}`);
      return true;
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [phone, countryCode, isValid, login]);

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
