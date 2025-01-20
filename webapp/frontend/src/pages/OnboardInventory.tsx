import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DeviceManagement from "../components/DeviceManagement";
import { useOnboardingStore } from "../stores/onboarding";


export default function OnboardInventoryPage() {
    const { step, setStep } = useOnboardingStore(
        (state) => state,
    )
    const navigateTo = useNavigate();

    const handleNext = async () => {
        try {
            setStep(step + 1);
            navigateTo('/onboard/finish');
        } catch (error) {
            console.error('Error during bulk device creation:', error);
        }
    };

    return (
        <section className="flex flex-col h-full w-full pt-8 items-center">
            <h1 className="text-4xl font-bold mb-4">Device Inventory</h1>
            <DeviceManagement />
            <button className="mt-8 r-btn primary w-1/5 flex flex-row items-center justify-center gap-1" onClick={handleNext}>
                Continue <ArrowRight size={20} />
            </button>
        </section>
    )
}