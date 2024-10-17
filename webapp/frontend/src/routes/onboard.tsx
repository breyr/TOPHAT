import { Outlet } from "react-router-dom"
import OnboardBottomNav from "../components/OnboardBottomNav"
import OnboardTopNav from "../components/OnboardTapNav"

export default function OnboardLayout() {
    return (
        <section className="flex flex-col h-lvh p-[1.875rem]">
            <OnboardTopNav />
            <div className="flex-grow">
                <Outlet />
            </div>
            <OnboardBottomNav />
        </section>
    )
}