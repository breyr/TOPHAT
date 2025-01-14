import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AccountType, Model } from '../../../common/shared-types';

interface NewUser {
    email: string;
    username: string;
    tempPassword: string;
    accountType: AccountType;
}

interface NewDevice {
    deviceName: string;
    model: string;
    serialNumber: string;
    ports: string; // will be CSV that we need to parse
}
export interface InterconnectDevice extends NewDevice {
    ipAddress: string;
    username: string;
    password: string;
    secretPassword: string;
    type: 'INTERCONNECT'; // must be uppercase to match prisma enum
}

export interface LabDevice extends NewDevice {
    description: string;
    type: 'LAB'; // must be uppercase to match prisma enum
    icon: 'ROUTER' | 'SWITCH' | 'EXTERNAL' | 'SERVER'; // must be uppercase to match prisma enum
}

type OnboardingState = {
    step: number;
    model: Model;
    additionalUsers: NewUser[];
    interconnectDevices: InterconnectDevice[];
    labDevices: LabDevice[];
}

type OnboardingActions = {
    setModel: (model: Model) => void;
    setStep: (step: number) => void;
    addAdditionalUser: (user: NewUser) => void;
    updateAdditionalUser: (idx: number, user: Partial<NewUser>) => void;
    removeAdditionalUser: (idx: number) => void;
    addInterconnectDevice: (device: InterconnectDevice) => void;
    updateInterconnectDevice: (idx: number, device: Partial<InterconnectDevice>) => void;
    removeInterconnectDevice: (idx: number) => void;
    addLabDevice: (device: LabDevice) => void;
    updateLabDevice: (idx: number, device: Partial<LabDevice>) => void;
    removeLabDevice: (idx: number) => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;

export const useOnboardingStore = create<OnboardingStore>()(
    persist<OnboardingStore>(
        (set) => ({
            step: 1,
            model: null,
            additionalUsers: [],
            interconnectDevices: [],
            labDevices: [],
            connections: [],
            setStep: (step) => set({ step }),
            setModel: (model) => set({ model }),
            addAdditionalUser: (user) => set((state) => ({
                additionalUsers: [...state.additionalUsers, user]
            })),
            updateAdditionalUser: (index, user) => set((state) => {
                const newUsers = [...state.additionalUsers];
                newUsers[index] = { ...newUsers[index], ...user };
                return { additionalUsers: newUsers };
            }),
            removeAdditionalUser: (index) => set((state) => ({
                additionalUsers: state.additionalUsers.filter((_, i) => i !== index)
            })),
            addInterconnectDevice: (device) => set((state) => ({
                interconnectDevices: [...state.interconnectDevices, device]
            })),
            updateInterconnectDevice: (index, device) => set((state) => {
                const newDevices = [...state.interconnectDevices];
                newDevices[index] = { ...newDevices[index], ...device };
                return { interconnectDevices: newDevices };
            }),
            removeInterconnectDevice: (index) => set((state) => ({
                interconnectDevices: state.interconnectDevices.filter((_, i) => i !== index)
            })),
            addLabDevice: (device) => set((state) => ({
                labDevices: [...state.labDevices, device]
            })),
            updateLabDevice: (index, device) => set((state) => {
                const newDevices = [...state.labDevices];
                newDevices[index] = { ...newDevices[index], ...device };
                return { labDevices: newDevices };
            }),
            removeLabDevice: (index) => set((state) => ({
                labDevices: state.labDevices.filter((_, i) => i !== index)
            })),
        }),
        {
            name: 'onboarding-state',
            storage: createJSONStorage(() => sessionStorage)
        }
    )
)