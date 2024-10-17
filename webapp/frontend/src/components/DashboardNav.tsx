import { ChartNetwork } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardNav() {

    const navigateTo = useNavigate();
    const signout = () => {
        sessionStorage.removeItem('token');
        navigateTo('/')
    }

    return (
        <nav className="w-full flex flex-row items-center justify-between border-b-2 py-2 px-2">
            <div className="flex flex-row gap-1 items-center">
                <ChartNetwork size={24} className="mx-2 " />
                <h4 className="p-0 m-0 tracking-wider text-lg">IaaSma</h4>
            </div>
            <div className="flex flex-row items-center gap-2">
                <h4 className="hover:cursor-pointer hover:text-blue-400">Settings</h4>
                <h4 onClick={signout} className="hover:cursor-pointer hover:text-blue-400">Log Out</h4>
            </div>
        </nav>
    )
}
