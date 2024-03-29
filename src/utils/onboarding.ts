export type OnboardingType = 'done' | 'active' | 'inactive';

export type OnboardingLocalStorage = {
  tiled: OnboardingType;
  maps: OnboardingType;
  createGame: OnboardingType;
};

const defaultOnboarding: OnboardingLocalStorage = {
  tiled: 'active',
  maps: 'inactive',
  createGame: 'inactive',
};

export const getOnboarding = (): OnboardingLocalStorage => {
  const onboarding = localStorage.getItem('onboarding');
  if (!onboarding) return defaultOnboarding;

  return JSON.parse(onboarding);
};

export const updateOnboarding = (updated: OnboardingLocalStorage) => {
  localStorage.setItem('onboarding', JSON.stringify(updated));
};
