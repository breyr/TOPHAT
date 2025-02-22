import React from 'react';
import { useToast } from '../hooks/useToast';
import LinkToast from './Toast';

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
            {toasts.map(toast => (
                <LinkToast
                    key={toast.id}
                    title={toast.title}
                    body={toast.body}
                    status={toast.status}
                    onDismiss={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

export default ToastContainer;