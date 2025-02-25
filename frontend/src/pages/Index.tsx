import { ArrowRight } from "lucide-react";
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import LoginUser from "../components/auth/LoginUser";
import { useAuth } from "../hooks/useAuth";

export default function IndexPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [onboardComplete, setOnboardComplete] = useState<boolean | null>(null);


    // on mount if the token exists redirect to the dashboard
    useEffect(() => {
        if (user) {
            navigate("/dashboard/")
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/config/OnboardComplete');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setOnboardComplete(data.data.value === 'true');
            } catch (error) {
                console.error('Error fetching config:', error);
            }
        };

        fetchConfig();
    }, []);

    return (
        <section className="h-lvh flex flex-col p-[1.875rem]">
            <section className="flex-1 flex flex-row gap-5">
                <div className="w-2/3 relative r-card bg-gray-200 flex items-center justify-center">
                    <h2 className="text-3xl font-bold text-gray-700">Placeholder Content</h2>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <section className="px-16">
                        <h1 className="text-[2rem] mb-2">Capstone Testbed</h1>
                        {!onboardComplete && <div className="flex flex-row items-center">
                            <p>First time setup?</p>
                            <p className="r-btn tertiary flex items-center hover:cursor-pointer" onClick={() => navigate("/onboard/users")}>
                                Complete onboarding <ArrowRight size={18} />
                            </p>
                        </div>}
                        <LoginUser redirectToDashboard={true} />
                        <div className="flex justify-center">
                            <button className="r-btn tertiary">Need help signing in?</button>
                        </div>
                    </section>
                </div>
            </section>
        </section>
    )
}