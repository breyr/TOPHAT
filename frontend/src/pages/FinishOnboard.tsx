import { PartyPopper } from 'lucide-react'; // Ensure you install lucide-react if you haven't already
import { useNavigate } from 'react-router-dom';

function OnboardingPage() {
    const navigate = useNavigate();

    const handleExploreDashboard = () => {
        navigate('/dashboard/');
    };

    return (
        <section className="flex flex-col  w-full items-center justify-center">
            <div className="w-full max-w-xl p-10 bg-[#ffffff] shadow-lg rounded-lg text-center">
                <div className="flex justify-center mb-6">
                    <PartyPopper className="text-blue-500 w-12 h-12" />
                </div>
                <h1 className="text-4xl font-extrabold mb-4 text-gray-800">
                    Welcome to TOP<span className="text-blue-500">HAT</span>
                </h1>
                <p className="text-gray-600 text-lg mb-8">
                    You're all set to start creating network topologies. Don’t worry, you can always update your
                    setup later. Have fun!
                </p>
                <button
                    className="r-btn primary px-8 py-3 text-white bg-blue-600 font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={handleExploreDashboard}
                >
                    Explore Dashboard
                </button>
            </div>
        </section>
    );
}

export default OnboardingPage;
