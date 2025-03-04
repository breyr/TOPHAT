import React from 'react';
import { useToast } from '../hooks/useToast';
import LinkToast from './Toast';

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    const toastElements = toasts.map(t => (
        <LinkToast
            key={t.id}
            title={t.title}
            body={t.body}
            status={t.status}
            onDismiss={() => removeToast(t.id)}
        />
    ));

    return (
        <div className="fixed bottom-4 right-4 space-y-2 z-50 flex flex-col gap-2 max-w-96">
            {toastElements}
        </div>
    );
};

export default ToastContainer;