import { jwtDecode, JwtPayload } from 'jwt-decode';
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import type { AccountStatus, AccountType, LoginResponsePayload, RegisterUserResponsePayload } from '../../../common/src/index';
import { ApiClient } from "../lib/authenticatedApi.ts";
import { User } from '../models/User.ts';

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
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authState, setAuthState] = useState<{ token: string | null, user: CustomJwtPayload | null }>(
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
            const user = jwtDecode<CustomJwtPayload>(token);
            setAuthState({ token, user });

            // check token expiration
            const expirationTime = user.exp! * 1000;
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
            // return error message from backend
            return { success: false, message: resJson.message || 'Login failed - no token received' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login.' };
        }
    }

    // registration helper
    const register = async (username: string, email: string, password: string, tempPassword: string, accountType: AccountType, accountStatus: AccountStatus, autoLogin: boolean): Promise<RegisterUserResponsePayload> => {
        // attempt to register and login
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password, tempPassword, accountType, accountStatus })
            });

            const resJson: RegisterUserResponsePayload = await response.json();

            // validation errors
            if (!response.ok) {
                return resJson;
            }

            // call login immediately after a successful registration
            if (autoLogin) login(username, password);

            return resJson;
        } catch (error) {
            console.error('Login error:', error);
            return { message: 'Login error', data: {} } // user wasn't created
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
                register,
                updateUser,
                authenticatedApiClient,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};