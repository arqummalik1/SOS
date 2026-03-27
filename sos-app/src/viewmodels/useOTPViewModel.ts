import { useState, useCallback } from 'react';
import { useAuth } from '../store/AuthContext';

export const useOTPViewModel = () => {
  const { verifyOTP } = useAuth();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);

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
    setResendTimer(30);
    // Mock resend
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

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
