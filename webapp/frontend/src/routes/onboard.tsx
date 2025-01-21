import { Outlet } from "react-router-dom";
import OnboardBottomNav from "../components/OnboardBottomNav";
import OnboardTopNav from "../components/OnboardTopNav";

export default function OnboardLayout() {
    return (
        <section className="flex flex-col h-lvh p-[1.875rem]">
            <OnboardTopNav />
            <div className="flex flex-1 justify-center items-center">
                <Outlet />
            </div>
            <OnboardBottomNav />
        </section>
    );
}