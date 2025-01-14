import { ArrowRight } from "lucide-react";
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import LoginUser from "../components/auth/LoginUser";
import { useAuth } from "../hooks/useAuth";

export default function IndexPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // on mount if the token exists redirect to the dashboard
    useEffect(() => {
        if (user) {
            navigate("/dashboard/")
        }
    }, [user, navigate]);

    return (
        <section className="h-lvh flex flex-col p-[1.875rem]">
            <section className="flex-1 flex flex-row gap-5">
                <div className="w-2/3 relative r-card bg-gray-200 flex items-center justify-center">
                    <h2 className="text-3xl font-bold text-gray-700">Placeholder Content</h2>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <section className="px-16">
                        <h1 className="text-[2rem] mb-0">Capstone Testbed</h1>
                        <div className="flex flex-row items-center">
                            <p>First time setup?</p>
                            <p className="r-btn tertiary flex items-center hover:cursor-pointer" onClick={() => navigate("/onboard/")}>
                                Complete onboarding <ArrowRight size={18} />
                            </p>
                        </div>
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