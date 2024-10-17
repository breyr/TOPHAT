import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    token: string | null;
    setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setTokenState] = useState<string | null>(() => sessionStorage.getItem('token'));

    const setToken = (newToken: string | null) => {
        setTokenState(newToken);
        if (newToken) {
            sessionStorage.setItem('token', newToken);
        } else {
            sessionStorage.removeItem('token');
        }
    };

    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        if (storedToken) {
            setTokenState(storedToken);
        }
    }, []);

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