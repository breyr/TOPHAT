import { create } from 'zustand';
import type { Model } from '../types/types';

interface AdminCredentials {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}

interface NewUser {
    email: string;
    username: string;
    tempPassword: string;
    accountType: string;
}

type OnboardingState = {
    step: number;
    model: Model;
    adminCredentials: AdminCredentials;
    additionalUsers: NewUser[];
}

type OnboardingActions = {
    setModel: (model: Model) => void;
    setStep: (step: number) => void;
    setAdminCredentials: (credentials: Partial<AdminCredentials>) => void;
    addAdditionalUser: (user: NewUser) => void;
    updateAdditionalUser: (idx: number, user: Partial<NewUser>) => void;
    removeAdditionalUser: (idx: number) => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;

export const useOnboardingStore = create<OnboardingStore>((set) => ({
    step: 1,
    model: null,
    adminCredentials: {
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    },
    additionalUsers: [],
    setStep: (step) => set({ step }),
    setModel: (model) => set({ model }),
    setAdminCredentials: (credentials) => set((state) => ({
        // merge state, only change the kv pairs in credentials
        adminCredentials: { ...state.adminCredentials, ...credentials }
    })),
    addAdditionalUser: (user) => set((state) => ({
        // add a NewUser object to the additionalUsers array
        additionalUsers: [...state.additionalUsers, user]
    })),
    updateAdditionalUser: (index, user) => set((state) => {
        // get the current state of the additionalUsers array
        const newUsers = [...state.additionalUsers];
        // update the specific user object that we need to
        newUsers[index] = { ...newUsers[index], ...user };
        // return the state setting additionalUsers = newUsers
        return { additionalUsers: newUsers };
    }),
    removeAdditionalUser: (index) => set((state) => ({
        // just filter additionalUsers to remove the user object we deleted from the table
        additionalUsers: state.additionalUsers.filter((_, i) => i !== index)
    })),
}))