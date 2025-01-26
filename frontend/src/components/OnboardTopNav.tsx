import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useOnboardingStore } from '../stores/onboarding';

export default function OnboardTopNav() {

    const { step, setStep } = useOnboardingStore(
        (state) => state, // select the entire state object for this store, can specify by using dot notation
    );
    const nav = useNavigate();
    const location = useLocation();

    const goBack = () => {
        if (step == 1) {
            nav('/')
        } else {
            setStep(step - 1)
            nav(-1)
        }
    }

    useEffect(() => {
        // Update the step based on the current location
        const path = location.pathname;
        if (path.includes('inventory')) {
            setStep(2);
        } else if (path.includes('finish')) {
            setStep(3);
        } else {
            setStep(1);
        }
    }, [location, setStep]);

    return (
        <nav className='relative flex flex-row justify-between items-center'>
            <button onClick={goBack} className="flex flex-row items-center text-md gap-1 text-blue-500 font-bold hover:text-blue-600">
                <ArrowLeft size={20} /> Go {step == 1 ? 'back to login' : 'to previous step'}
            </button>
        </nav>
    )
}