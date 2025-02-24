import React, { createContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Toast {
    id: string;
    title: string;
    body: string;
    status: 'pending' | 'success' | 'error';
}

interface ToastContextProps {
    toasts: Toast[];
    addToast: (toast: Toast) => void;
    updateToast: (id: string, status: 'success' | 'error', title: string, body?: string) => void;
    removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const { token } = useAuth();

    // clear toasts on logout
    useEffect(() => {
        if (!token) {
            setToasts([]);
        }
    }, [token]);

    const addToast = (toast: Toast) => {
        setToasts(prevToasts => {
            const newToasts = [...prevToasts, { ...toast }];
            return newToasts;
        });
    };

    const updateToast = (id: string, status: 'success' | 'error', title: string, body?: string) => {
        setToasts(prevToasts => {
            const updatedToasts = prevToasts.map(toast =>
                toast.id === id
                    ? {
                        ...toast,
                        status,
                        title,
                        ...(body !== undefined && { body })
                    }
                    : toast
            );
            return updatedToasts;
        });
    };

    const removeToast = (id: string) => {
        setToasts(prevToasts => {
            const newToasts = prevToasts.filter(toast => toast.id !== id);
            return newToasts;
        });
    };

    return (
        <ToastContext.Provider value={{ toasts, addToast, updateToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};