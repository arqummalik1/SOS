import { OnboardingStatus } from '../services/authService';

export type OnboardingRouteName =
  | 'ProfileSetupHub'
  | 'ProfileSetup'
  | 'FullBodyPhoto'
  | 'BodyMeasurements'
  | 'StylePreferences'
  | 'Main';

const isStepDone = (steps: Record<string, boolean> | undefined, key: string): boolean =>
  Boolean(steps && steps[key]);

export const resolveNextOnboardingRoute = (status: OnboardingStatus): OnboardingRouteName => {
  if (status.isOnboardingComplete) {
    return 'Main';
  }

  const steps = status.steps;
  if (!isStepDone(steps, 'profile_image')) {
    return 'ProfileSetupHub';
  }
  if (!isStepDone(steps, 'basic_details')) {
    return 'ProfileSetup';
  }
  if (!isStepDone(steps, 'full_body_image')) {
    return 'FullBodyPhoto';
  }
  if (!isStepDone(steps, 'body_shape')) {
    return 'BodyMeasurements';
  }
  if (!isStepDone(steps, 'skin_tone_style')) {
    return 'StylePreferences';
  }
  return 'Main';
};
