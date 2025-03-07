import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import OnboardBottomNav from "../components/OnboardBottomNav";
import OnboardTopNav from "../components/OnboardTopNav";

export default function OnboardLayout() {
    const navigateTo = useNavigate();
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/config/OnboardComplete');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                if (data.data.value === 'true') {
                    navigateTo('/');
                }
            } catch (error) {
                console.error('Error fetching config:', error);
            }
        };

        fetchConfig();
    }, [navigateTo]);

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