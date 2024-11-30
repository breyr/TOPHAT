import { jwtDecode } from 'jwt-decode';
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ApiClient } from "../lib/authenticatedApi.ts";
import { UserJwtPayload } from "../types/types";

interface AuthContextType {
    user: UserJwtPayload | null;
    token: string | null;
    login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    authenticatedApiClient: ApiClient;
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

    // logout helper
    const logout = useCallback(() => {
        sessionStorage.removeItem('token');
        setAuthState({ token: null, user: null });
    }, []);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (token) {
            const user = jwtDecode<UserJwtPayload>(token);
            setAuthState({ token, user });

            // check token expiration
            const expirationTime = user.exp * 1000;
            const currentTime = Date.now();

            if (expirationTime < currentTime) {
                logout();
            } else {
                // set timeout to log out before the token expires
                const timeout = expirationTime - currentTime - 60 * 1000;
                const timerId = setTimeout(() => {
                    logout();
                }, timeout);

                // cleanup
                return () => clearTimeout(timerId);
            }
        }
    }, [logout]);

    // login helper
    const login = async (usernameOrEmail: string, password: string): Promise<{ success: boolean, message?: string }> => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usernameOrEmail, password }),
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

    const getToken = useCallback(() => {
        return authState.token;
    }, [authState.token]);

    // authenticate api client
    const authenticatedApiClient = useMemo(() => new ApiClient({
        baseUrl: '/api',
        getToken,
    }), [getToken]);

    return (
        <AuthContext.Provider
            value={{
                user: authState.user,
                token: authState.token,
                login,
                logout,
                authenticatedApiClient,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};