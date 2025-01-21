import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '../stores/onboarding';

export default function OnboardTopNav() {

    const { step, setStep, model } = useOnboardingStore(
        (state) => state, // select the entire state object for this store, can specify by using dot notation
    );
    const nav = useNavigate();

    const goBack = () => {
        if (step == 1) {
            nav('/')
        } else {
            setStep(step - 1)
            nav(-1)
        }
    }

    return (
        <nav className='relative flex flex-row justify-between items-center'>
            <button onClick={goBack} className="flex flex-row items-center text-md gap-1 text-blue-500 font-bold hover:text-blue-600">
                <ArrowLeft size={20} /> Go {step == 1 ? 'back to login' : 'to previous step'}
            </button>
            {
                model && step != 1 && (
                    <p className="r-chip absolute right-0">
                        {model}
                    </p>
                )
            }
        </nav>
    )
}