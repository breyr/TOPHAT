import { useOnboardingStore } from "../stores/onboarding";

export default function OnboardBottomNav() {
    const step = useOnboardingStore(
        (state) => state.step, // only retrieving step value from the OnboardingStore state
    );

    // handling steps from context
    // have to use or statements otherwise each circle is filled for only its own page
    const isStep1 = step == 1 || step == 2 || step == 3
    const isStep2 = step == 2 || step == 3 
    const isStep3 = step == 3

    return (
        <nav className="w-5/12 mx-auto py-8">
            <div className="flex items-center">
                <span
                    className={`font-bold rounded-full size-10 border-2 border-[#1d69cc] flex justify-center items-center ${isStep1 ? 'bg-[#1d69cc] text-gray-200' : 'text--[#1d69cc]'}`}>
                    1
                </span>
                <div className={`flex-grow border-t-4 ${isStep2 ? 'border-[#1d69cc]' : ''}`}></div>
                <span
                    className={`font-bold rounded-full size-10 border-2 border-[#1d69cc] flex justify-center items-center ${isStep2 ? 'bg-[#1d69cc] text-gray-200' : 'text-[#1d69cc]'}`}>
                    2
                </span>
                <div className={`flex-grow border-t-4 ${isStep3 ? 'border-[#1d69cc]' : ''}`}></div>
                <span
                    className={`font-bold rounded-full size-10 border-2 border-[#1d69cc] flex justify-center items-center ${isStep3 ? 'bg-[#1d69cc] text-gray-200' : 'text-[#1d69cc]'}`}>
                    3
                </span>
            </div>
        </nav>
    )
}