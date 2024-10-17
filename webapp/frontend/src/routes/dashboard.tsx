import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import DashboardNav from "../components/DashboardNav";
import { useAuth } from "../context/AuthContext";
import { UserJwtPaylod } from "../types/types";

export default function DashboardLayout() {
    const location = useLocation();
    const navigateTo = useNavigate();
    const { token } = useAuth();
    const [decodedToken, setDecodedToken] = useState<UserJwtPaylod | null>(null);

    useEffect(() => {
        if (!token) {
            console.log('No token found, redirecting to root');
            navigateTo("/");
        } else {
            try {
                const decoded = jwtDecode<UserJwtPaylod>(token);
                setDecodedToken(decoded);
            } catch (error) {
                console.error('Invalid token:', error);
                navigateTo("/");
            }
        }
    }, [token, navigateTo]);

    const getTabClass = (path: string) => {
        return location.pathname === `/dashboard${path}` ? "border-b-2 border-b-blue-400" : "border-b-2";
    };

    return (
        <section className="flex flex-col h-lvh">
            <DashboardNav />
            <section className="p-[1.875rem]">
                <h1>Welcome, {decodedToken?.username}.</h1>
                {/* tabs */}
                <div className="flex flex-row items-center gap-5">
                    <Link to="/dashboard/" className={getTabClass("/")}>
                        Topologies
                    </Link>
                    <Link to="/dashboard/inventory" className={getTabClass("/inventory")}>
                        Inventory
                    </Link>
                    <Link to="/dashboard/users" className={getTabClass("/users")}>
                        Users
                    </Link>
                </div>
                <div className="flex-grow">
                    <Outlet />
                </div>
            </section>
        </section>
    );
}