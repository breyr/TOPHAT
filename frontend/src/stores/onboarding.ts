import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type OnboardingState = {
    step: number;
}

type OnboardingActions = {
    setStep: (step: number) => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;

export const useOnboardingStore = create<OnboardingStore>()(
    persist<OnboardingStore>(
        (set) => ({
            step: 1,
            model: null,
            setStep: (step) => set({ step }),
        }),
        {
            name: 'onboarding-state',
            storage: createJSONStorage(() => sessionStorage)
        }
    )
)