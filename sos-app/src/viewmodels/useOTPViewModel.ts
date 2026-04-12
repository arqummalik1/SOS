import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../store/AuthContext';

export const useOTPViewModel = () => {
  const { verifyOTP } = useAuth();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    // Clear any existing interval before starting a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setResendTimer(30);
    
    intervalRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Auto-start timer on mount
  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTimer]);

  const isComplete = otp.every((digit) => digit !== '');

  const handleChange = useCallback((index: number, val: string) => {
    if (val.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    setError(null);
  }, [otp]);

  const handleVerify = useCallback(async () => {
    if (!isComplete) {
      setError('Please enter all 6 digits');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const otpString = otp.join('');
      const success = await verifyOTP(otpString);
      if (!success) {
        setError('Invalid OTP. Please try again.');
      }
      return success;
    } catch (err) {
      setError('Verification failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [otp, isComplete, verifyOTP]);

  const handleResend = useCallback(() => {
    // Logic for actual resend would go here
    startTimer(); // Restart the countdown timer
  }, [startTimer]);

  return {
    otp,
    isComplete,
    isLoading,
    error,
    resendTimer,
    handleChange,
    handleVerify,
    handleResend,
    clearError: () => setError(null),
  };
};
