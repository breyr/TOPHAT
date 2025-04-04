import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import DashboardNav from "../components/DashboardNav";
import UserSetupModal from "../components/UserSetupModal";
import { useAuth } from "../hooks/useAuth";

export default function DashboardLayout() {
    const location = useLocation();
    const navigateTo = useNavigate();
    const { user } = useAuth();
    const [showUserSetup, setShowUserSetup] = useState(false);

    useEffect(() => {
        if (!user) {
            navigateTo("/");
        } else if (user.accountStatus === 'PENDING') {
            setShowUserSetup(true);
        }
    }, [user, navigateTo]); // useNavigate is a stable reference so this is okay

    const getTabClass = (path: string) => {
        return location.pathname === `/dashboard${path}` ? "font-bold" : "";
    };

    return (
        <section className="flex flex-col h-lvh">
            <DashboardNav />
            <section className="p-[1.875rem]">
            <h2 className="mt-0">Welcome, {user?.username ? user.username : "User"}.</h2>
            {/* tabs */}
                <div className="flex flex-row items-center gap-6">
                    <Link to="/dashboard/" className={getTabClass("/")}>
                        Topologies
                    </Link>
                    <Link to="/dashboard/archived" className={getTabClass("/archived")}>
                        Archived
                    </Link>
                    {
                        (user?.accountType === 'ADMIN' || user?.accountType === 'OWNER')
                        &&
                        <>
                            <Link to="/dashboard/inventory" className={getTabClass("/inventory")}>
                                Inventory
                            </Link>
                            <Link to="/dashboard/users" className={getTabClass("/users")}>
                                Users
                            </Link>
                            <Link to="/dashboard/alltopologies" className={getTabClass("/alltopologies")}>
                                All Topologies
                            </Link>
                        </>
                    }
                </div>
                <div className="flex-grow">
                    <Outlet />
                </div>
            </section>
            {showUserSetup && <UserSetupModal onSubmit={() => setShowUserSetup(false)} />}
        </section>
    );
}