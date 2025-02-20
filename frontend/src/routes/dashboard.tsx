import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import DashboardNav from "../components/DashboardNav";
import { useAuth } from "../hooks/useAuth";
import UserSetupModal from "../components/UserSetupModal";

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
        return location.pathname === `/dashboard${path}` ? "border-b-2 border-b-blue-400" : "border-b-2";
    };

    return (
        <section className="flex flex-col h-lvh">
            <DashboardNav />
            <section className="p-[1.875rem]">
                <h1>Welcome, {user?.username}.</h1>
                {/* tabs */}
                <div className="flex flex-row items-center gap-5">
                    <Link to="/dashboard/" className={getTabClass("/")}>
                        Topologies
                    </Link>
                    <Link to="/dashboard/archived" className={getTabClass("/archived")}>
                        Archived
                    </Link>
                    {
                        user?.accountType === 'ADMIN' || user?.accountType === 'OWNER'
                        &&
                        <>
                            <Link to="/dashboard/inventory" className={getTabClass("/inventory")}>
                                Inventory
                            </Link>
                            <Link to="/dashboard/users" className={getTabClass("/users")}>
                                Users
                            </Link>
                            <Link to="/dashboard/alltopologies" className={getTabClass("/alltopologies")}>
                                All User's Topologies
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