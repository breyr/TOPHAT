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
    if (user && onboardComplete) {
        navigate("/dashboard/")
    }

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
            {/* Animated background elements */}
            <div className="absolute top-1/4 right-[40%] w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-1/3 left-[17%] w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
            <section className="flex-1 flex flex-row gap-5">
                <div className="flex items-center justify-center w-2/3">
                    <div>
                        <div className="inline-block px-3 py-1 rounded-full bg-blue-200/50 text-blue-600 text-xs font-medium mb-6">
                            Open Source Network Topology Platform
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
                            Physical Networks, <br /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0070F3] to-[#0050A6] animate-gradient-x">Virtually Designed</span>
                        </h1>

                        <p className="text-lg text-gray-600 max-w-3xl mb-10">
                            Transform digital network topologies into physical connections with ease.
                            <br />
                            Design, manage, and deploy with a user-friendly interface.
                        </p>

                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <a href="https://github.com/breyr/TOPHAT/blob/main/README.md" target="_blank">
                                <button className="r-btn primary flex flex-row items-center gap-2">
                                    Read the Docs
                                    <ArrowRight size={20} />
                                </button>
                            </a>

                            <a href="https://github.com/breyr/TOPHAT" target="_blank">
                                <button className="r-btn secondary flex flex-row items-center">
                                    View on GitHub
                                </button>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <section className="px-16">
                        <h1 className="text-[2rem] mb-2">TOP<span className="text-blue-500">HAT</span></h1>
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