import { jwtDecode } from 'jwt-decode';
import { createContext, ReactNode, useEffect, useState } from 'react';
import { UserJwtPaylod } from "../types/types";

interface AuthContextType {
    token: string | null;
    decodedToken: UserJwtPaylod | null;
    setToken: (token: string | null) => void;
}

// TODO set up jwt token refreshing

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setTokenState] = useState<string | null>(() => {
        return sessionStorage.getItem('token');
    });
    const [decodedToken, setDecodedToken] = useState<UserJwtPaylod | null>(null);

    const setToken = (newToken: string | null) => {
        console.log('Setting token:', newToken); // Debug log
        setTokenState(newToken);
        if (newToken) {
            sessionStorage.setItem('token', newToken);
            try {
                const decoded = jwtDecode<UserJwtPaylod>(newToken);
                setDecodedToken(decoded);
            } catch {
                setDecodedToken(null);
            }
        } else {
            sessionStorage.removeItem('token');
            setDecodedToken(null);
        }
    };

    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ token, setToken, decodedToken }}>
            {children}
        </AuthContext.Provider>
    );
};