import { GraduationCap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import SettingsModal from "./SettingsModal";

export default function DashboardNav() {

    const { logout } = useAuth();
    const navigateTo = useNavigate();
    const logoutAndRedirect = () => {
        logout();
        navigateTo('/');
    }
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const handleSettingsClick = () => {
        setIsSettingsOpen(true)
    };

    return (
        <nav className="w-full flex flex-row items-center justify-between border-b-2 py-2 px-2">
            <div className="flex flex-row gap-1 items-center">
                <GraduationCap size={27} className="mx-2 pb-1" />
                <h4 className="p-0 m-0 tracking-wider text-lg">TOP<span className="text-blue-500">HAT</span></h4>
            </div>
            <div className="flex flex-row items-center gap-2">
                <h4 onClick={handleSettingsClick} className="hover:cursor-pointer hover:text-blue-400">Settings</h4>
                <h4 onClick={logoutAndRedirect} className="hover:cursor-pointer hover:text-blue-400">Log Out</h4>
            </div>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </nav>
    )
}
