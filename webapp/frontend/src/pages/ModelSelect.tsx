import { ArrowRight, GraduationCap, Router } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { useOnboardingStore } from "../stores/onboarding";

export default function ModelSelectPage() {
    const { step, setStep, model, setModel } = useOnboardingStore(
        (state) => state,
    );
    const navigateTo = useNavigate();

    const handleNext = () => {
        // update step
        setStep(step + 1)
        navigateTo('/onboard/users');
    };

    return (
        <section className="flex-1 p-8 flex flex-col">
            <h1 className="text-center text-4xl font-bold">Choose a Model</h1>
            <div className="flex-1 flex flex-row justify-center items-center gap-10 py-4">
                <Card
                    title="Multi-Tenant"
                    description="Perfect for Networking Labs at Universities"
                    benefits={['Multiple users', 'Equipment reservation', 'Equipment inventory', 'Topologies per user',]}
                    icon={<GraduationCap size={48} className="text-blue-500" />}
                    isSelected={model === "multi-tenant"}
                    onSelect={() => setModel("multi-tenant")}
                />
                <Card
                    title="Single User"
                    description="Perfect for Home Labs"
                    benefits={['God mode', 'Topologies', 'Equipment inventory', 'Custom configuration']}
                    icon={<Router size={48} className="text-blue-500" />}
                    isSelected={model === "single-user"}
                    onSelect={() => setModel("single-user")}
                />
            </div>
            <div className="flex flex-row justify-center mx-auto w-1/4 h-20 mt-12">
                {model ? (
                    <button className="r-btn primary w-1/2 flex flex-row items-center justify-center gap-1" onClick={handleNext}>
                        Continue <ArrowRight size={20} />
                    </button>
                ) : (
                    // placeholder with the same height as the button
                    <div className="h-20"></div>
                )}
            </div>
        </section>
    );
}