import { useState, useCallback } from 'react';
import { ProfileSetupData } from '../models/User.model';
import { useUser } from '../store/UserContext';
import { useAuth } from '../store/AuthContext';

export const useProfileSetupViewModel = () => {
  const { saveProfileSetup } = useUser();
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [dob, setDob] = useState({ day: '', month: '', year: '' });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [stylePreferences, setStylePreferences] = useState<string[]>([]);
  const [colorPreferences, setColorPreferences] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState('₹3,000');

  const setField = useCallback((key: string, value: string) => {
    switch (key) {
      case 'name':
        setName(value);
        break;
      case 'height':
        setHeight(value);
        break;
      case 'weight':
        setWeight(value);
        break;
      case 'day':
        setDob((prev) => ({ ...prev, day: value }));
        break;
      case 'month':
        setDob((prev) => ({ ...prev, month: value }));
        break;
      case 'year':
        setDob((prev) => ({ ...prev, year: value }));
        break;
      case 'profileImage':
        setProfileImage(value);
        break;
    }
  }, []);

  const toggleStylePreference = useCallback((style: string) => {
    setStylePreferences((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  }, []);

  const toggleColorPreference = useCallback((color: string) => {
    setColorPreferences((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  }, []);

  const handleNext = useCallback(() => {
    if (step < 4) {
      setStep((prev) => prev + 1);
    }
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  }, [step]);

  const handleComplete = useCallback(async () => {
    const data: ProfileSetupData = {
      name,
      height,
      weight,
      dob,
      profileImage,
      stylePreferences,
      colorPreferences,
      budgetRange,
    };

    await saveProfileSetup(data);
    await completeOnboarding();
    return true;
  }, [name, height, weight, dob, profileImage, stylePreferences, colorPreferences, budgetRange, saveProfileSetup, completeOnboarding]);

  const canProceed = () => {
    switch (step) {
      case 1:
        return name && height && weight && dob.day && dob.month && dob.year;
      case 2:
        return stylePreferences.length > 0;
      case 3:
        return colorPreferences.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return {
    step,
    name,
    height,
    weight,
    dob,
    profileImage,
    stylePreferences,
    colorPreferences,
    budgetRange,
    setField,
    setBudgetRange,
    toggleStylePreference,
    toggleColorPreference,
    handleNext,
    handleBack,
    handleComplete,
    canProceed: canProceed(),
  };
};
