import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AuthApiResponse } from "../types/types";

export default function IndexPage() {
    const navigateTo = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const { setToken } = useAuth();

    // handle login
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await fetch('/api/auth/login', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data: AuthApiResponse = await response.json();
        if (response.ok) {
            // store token
            setToken(data.access_token!)
            navigateTo('/dashboard/')
        } else {
            setMessage(`${data.message}`)
        }
    }

    // handle navigating to onboarding
    function handleNext() {
        navigateTo('/onboard/');
    }

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
                            <p className="r-btn tertiary flex items-center hover:cursor-pointer" onClick={handleNext}>
                                Complete onboarding <ArrowRight size={18} />
                            </p>
                        </div>
                        <form onSubmit={handleLogin} className="flex flex-col mt-10 mb-6">
                            <label className="font-bold" htmlFor="email">Email / Username</label>
                            <input className="r-input large" name="email" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                            <label className="font-bold mt-4" htmlFor="password">Password</label>
                            <input className="r-input large" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <button type="submit" className="r-btn primary mt-5">Log In</button>
                            <span>{message}</span>
                        </form>
                        <div className="flex justify-center">
                            <button className="r-btn tertiary">Need help signing in?</button>
                        </div>
                    </section>
                </div>
            </section>
        </section>
    )
}