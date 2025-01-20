import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Model } from '../../../common/shared-types';

type OnboardingState = {
    step: number;
    model: Model;
}

type OnboardingActions = {
    setModel: (model: Model) => void;
    setStep: (step: number) => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;

export const useOnboardingStore = create<OnboardingStore>()(
    persist<OnboardingStore>(
        (set) => ({
            step: 1,
            model: null,
            setStep: (step) => set({ step }),
            setModel: (model) => set({ model }),
        }),
        {
            name: 'onboarding-state',
            storage: createJSONStorage(() => sessionStorage)
        }
    )
)