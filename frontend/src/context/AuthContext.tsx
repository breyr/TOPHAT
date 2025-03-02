import type { AccountStatus, AccountType, LoginResponsePayload, RegisterUserResponsePayload } from 'common';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ApiClient } from "../lib/authenticatedApi.ts";

export interface CustomJwtPayload extends JwtPayload {
    id: number;
    username: string;
    email: string;
    accountType: AccountType;
    accountStatus: AccountStatus;
}

interface AuthContextType {
    user: CustomJwtPayload | null;
    token: string | null;
    login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    register: (username: string, email: string, password: string, tempPassword: string, accountType: AccountType, accountStatus: AccountStatus, autoLogin: boolean) => Promise<RegisterUserResponsePayload>;
    updateUser: (updatedUser: CustomJwtPayload) => void;
    authenticatedApiClient: ApiClient;
    loadingAuthState: boolean;
    refreshAccessToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authState, setAuthState] = useState<{ token: string | null, user: CustomJwtPayload | null }>(
        { token: null, user: null },
    );
    const [loadingAuthState, setLoadingAuthState] = useState(true);

    const logout = useCallback(() => {
        sessionStorage.removeItem('token');
        setAuthState({ token: null, user: null });
    }, []);

    const refreshAccessToken = useCallback(async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            logout();
            return;
        }

        try {
            const response = await fetch('/api/auth/refresh-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                logout();
                return;
            }

            const resJson = await response.json();
            const newToken = resJson.data.token;
            const user = jwtDecode<CustomJwtPayload>(newToken);
            setAuthState((prevState) => ({
                ...prevState,
                token: newToken,
                user,
            }));
            sessionStorage.setItem('token', newToken);
        } catch (error) {
            console.error('Refresh token error:', error);
            logout();
        }
    }, [logout]);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (token) {
            const user = jwtDecode<CustomJwtPayload>(token);
            setAuthState({ token, user });

            const expirationTime = user.exp! * 1000;
            const currentTime = Date.now();

            if (expirationTime < currentTime) {
                logout();
            } else {
                const timeout = expirationTime - currentTime - 60 * 1000;
                const timerId = setTimeout(() => {
                    refreshAccessToken();
                }, timeout);

                return () => clearTimeout(timerId);
            }
        }
        setLoadingAuthState(false);
    }, [logout, refreshAccessToken]);

    const login = async (usernameOrEmail: string, password: string): Promise<{ success: boolean, message?: string }> => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usernameOrEmail, password }),
            });

            const resJson: LoginResponsePayload = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: resJson.message || `Error: ${response.status} ${response.statusText}`
                }
            }

            if (resJson.data?.token) {
                const token = resJson.data.token;
                setAuthState({ token, user: jwtDecode<CustomJwtPayload>(token) });
                sessionStorage.setItem('token', token);
                return { success: true };
            }
            return { success: false, message: resJson.message || 'Login failed - no token received' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login.' };
        }
    }

    const register = async (username: string, email: string, password: string, tempPassword: string, accountType: AccountType, accountStatus: AccountStatus, autoLogin: boolean): Promise<RegisterUserResponsePayload> => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password, tempPassword, accountType, accountStatus })
            });

            const resJson: RegisterUserResponsePayload = await response.json();

            if (!response.ok) {
                return resJson;
            }

            if (autoLogin) login(username, password);

            return resJson;
        } catch (error) {
            console.error('Login error:', error);
            return { message: 'Login error', data: {} }
        }
    }

    const getToken = useCallback(() => {
        return authState.token;
    }, [authState.token]);

    const updateUser = (updatedUser: CustomJwtPayload) => {
        setAuthState((prevState) => ({
            ...prevState,
            user: updatedUser,
        }));
    };

    const authenticatedApiClient = useMemo(() => new ApiClient({
        getToken
    }), [getToken]);

    return (
        <AuthContext.Provider
            value={{
                user: authState.user,
                token: authState.token,
                login,
                logout,
                register,
                updateUser,
                authenticatedApiClient,
                loadingAuthState,
                refreshAccessToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};