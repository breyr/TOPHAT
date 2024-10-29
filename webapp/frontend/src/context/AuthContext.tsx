import { jwtDecode } from 'jwt-decode';
import {createContext, ReactNode, useEffect, useState} from 'react';
import { UserJwtPayload } from "../types/types";

interface AuthContextType {
    user: UserJwtPayload | null;
    token: string | null;
    login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
}

interface LoginResponse {
    success: boolean;
    message?: string;
    payload?: {
        token: string;
    };
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authState, setAuthState] = useState<{ token: string | null, user: UserJwtPayload | null }>(
        { token: null, user: null },
    );

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (token) {
            const user = jwtDecode<UserJwtPayload>(token);
            setAuthState({ token, user });
        }
    }, []);

    // login helper
    const login = async (username: string, password: string): Promise<{ success: boolean, message?: string }> => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data: LoginResponse = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || `Error: ${response.status} ${response.statusText}`
                }
            }

            if (data.success && data.payload?.token) {
                const token = data.payload.token;
                setAuthState({ token, user: jwtDecode<UserJwtPayload>(token) });
                sessionStorage.setItem('token', token);
                return { success: true };
            }
            // return error message from backend
            return { success: false, message: data.message || 'Login failed - no token received' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login.' };
        }
    }

    // logout helper
    const logout = () => {
        sessionStorage.removeItem('token');
        setAuthState({ token: null, user: null });
    }

    return (
        <AuthContext.Provider value={{
            user: authState.user,
            token: authState.token,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};