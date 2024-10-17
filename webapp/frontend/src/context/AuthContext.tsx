import { jwtDecode } from "jwt-decode";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AuthContextType {
    token: string | null;
    setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));

    // when the state of the token changes, take appropriate action
    useEffect(() => {
        if (token) {
            sessionStorage.setItem('token', token);
        } else {
            sessionStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {

        const refreshThreshold = process.env.NODE_ENV == 'production'
            ? 300000 // 5 minutes
            : 15000 // 15 seconds

        const checkTokenExpiry = () => {
            // we set exp to be one hour via the backend - for testing it is set to one minute
            if (token) {
                const decodedToken = jwtDecode<{ exp: number }>(token);
                const timeLeft = decodedToken.exp * 1000 - Date.now();
                // refresh token
                if (timeLeft < refreshThreshold) {
                    fetch('/api/account/refresh', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    })
                        .then(response => response.json())
                        .then(data => setToken(data.token))
                        .catch(() => setToken(null))
                }
            };
        }

        checkTokenExpiry();
        const interval = setInterval(checkTokenExpiry, 10000) // check every minute for prod, 10 seconds for testing

        return () => clearInterval(interval);
    }, [token, setToken]);

    return (
        <AuthContext.Provider value={{ token, setToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
