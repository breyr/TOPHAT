import { Alert, Spinner, Typography } from "@material-tailwind/react";
import { CircleCheck, CircleX } from "lucide-react";
import { useState } from "react";

interface ToastProps {
    title: string;
    body: string;
    status: 'pending' | 'success' | 'error';
    onDismiss: () => void;
}

export default function LinkToast({ title, body, status, onDismiss }: ToastProps) {
    const [isMinimized, setIsMinimized] = useState(false);

    return (
        <div
            className="fixed bottom-4 right-4 z-50 hover:cursor-pointer"
            onClick={() => setIsMinimized(!isMinimized)}
        >
            <Alert color={status === 'pending' ? 'warning' : status === 'success' ? 'success' : 'error'}>
                <Alert.Icon>
                    {status === 'pending' && <Spinner color="warning" size="md" />}
                    {status === 'success' && <CircleCheck size={24} />}
                    {status === 'error' && <CircleX size={24} />}
                </Alert.Icon>
                {
                    !isMinimized && (
                        <Alert.Content className="mt-0.5">
                            <div className="flex flex-row justify-between">
                                <Typography className="font-bold">{title}</Typography>
                                {status !== 'pending' ? (
                                    <Typography className="underline hover:cursor-pointer" onClick={onDismiss}>
                                        dismiss
                                    </Typography>
                                ) : (
                                    <Typography className="underline hover:cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                                        hide
                                    </Typography>
                                )}
                            </div>
                            <Typography>{body}</Typography>
                        </Alert.Content>
                    )
                }
            </Alert>
        </div>
    );
}