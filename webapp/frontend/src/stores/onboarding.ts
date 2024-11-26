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

interface NewDevice {
    deviceName: string;
    model: string;
    serialNumber: string;
    ports: string; // will be CSV that we need to parse
}

interface InterconnectDevice extends NewDevice {
    ipAddress: string;
    username: string;
    password: string;
    secretPassword: string;
    type: 'interconnect';
}

interface CommServerDevice extends NewDevice {
    ipAddress: string;
    type: 'comm server';
}

interface LabDevice extends NewDevice {
    type: 'lab';
}

type OnboardingState = {
    step: number;
    model: Model;
    adminCredentials: AdminCredentials;
    additionalUsers: NewUser[];
    interconnectDevices: InterconnectDevice[];
    commServerDevices: CommServerDevice[];
    labDevices: LabDevice[];
}

type OnboardingActions = {
    setModel: (model: Model) => void;
    setStep: (step: number) => void;
    setAdminCredentials: (credentials: Partial<AdminCredentials>) => void;
    addAdditionalUser: (user: NewUser) => void;
    updateAdditionalUser: (idx: number, user: Partial<NewUser>) => void;
    removeAdditionalUser: (idx: number) => void;
    addInterconnectDevice: (device: InterconnectDevice) => void;
    updateInterconnectDevice: (idx: number, device: Partial<InterconnectDevice>) => void;
    removeInterconnectDevice: (idx: number) => void;
    addCommServerDevice: (device: CommServerDevice) => void;
    updateCommServerDevice: (idx: number, device: Partial<CommServerDevice>) => void;
    removeCommServerDevice: (idx: number) => void;
    addLabDevice: (device: LabDevice) => void;
    updateLabDevice: (idx: number, device: Partial<LabDevice>) => void;
    removeLabDevice: (idx: number) => void;
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
    interconnectDevices: [],
    commServerDevices: [],
    labDevices: [],
    setStep: (step) => set({ step }),
    setModel: (model) => set({ model }),
    setAdminCredentials: (credentials) => set((state) => ({
        adminCredentials: { ...state.adminCredentials, ...credentials }
    })),
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
    addCommServerDevice: (device) => set((state) => ({
        commServerDevices: [...state.commServerDevices, device]
    })),
    updateCommServerDevice: (index, device) => set((state) => {
        const newDevices = [...state.commServerDevices];
        newDevices[index] = { ...newDevices[index], ...device };
        return { commServerDevices: newDevices };
    }),
    removeCommServerDevice: (index) => set((state) => ({
        commServerDevices: state.commServerDevices.filter((_, i) => i !== index)
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
}));