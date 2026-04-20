import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../store/AuthContext';
import { useApiRequest } from '../hooks/useApiRequest';

export const useOTPViewModel = () => {
  const { verifyOTP, resendOTP } = useAuth();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const verifyRequest = useApiRequest();
  const resendRequest = useApiRequest();

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
    setError(null);

    const result = await verifyRequest.execute(
      async () => {
        const otpString = otp.join('');
        const verification = await verifyOTP(otpString);
        if (!verification.success) {
          setError(verification.message || 'Invalid OTP. Please try again.');
        }
        return verification.success ? verification.message : null;
      },
      {
        onError: (requestError) => {
          setError(requestError.message || 'Verification failed. Please try again.');
        },
      }
    );
    return result;
  }, [otp, isComplete, verifyOTP, verifyRequest]);

  const handleResend = useCallback(async () => {
    setError(null);
    const result = await resendRequest.execute(
      async () => {
        const message = await resendOTP();
        startTimer();
        setOtp(['', '', '', '', '', '']);
        return message;
      },
      {
        onError: (requestError) => {
          setError(requestError.message || 'Failed to resend OTP.');
        },
      }
    );
    return result;
  }, [resendRequest, resendOTP, startTimer]);

  return {
    otp,
    isComplete,
    isLoading: verifyRequest.isLoading,
    isVerifying: verifyRequest.isLoading,
    isResending: resendRequest.isLoading,
    error,
    resendTimer,
    handleChange,
    handleVerify,
    handleResend,
    clearError: () => setError(null),
  };
};
