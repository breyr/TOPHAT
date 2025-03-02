import { Alert } from "@material-tailwind/react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ErrorState = {
    type: 'ID_MISSING' | 'NOT_FOUND' | 'FETCH_ERROR' | null;
    message: string;
};

interface ErrorDisplayProps {
    errorData: ErrorState;
}

const NotFound: React.FC<ErrorDisplayProps> = ({ errorData }) => {
    const navigateTo = useNavigate();
    if (!errorData.type) return null;

    return (
        <Alert className="border-0 w-3/4 p-6">
            <Alert.Content>
                <section className="flex flex-col items-center text-center">
                    <div className="mb-10">
                        <h1 className="text-6xl font-bold text-red-500">404</h1>
                        <p className="text-xl mt-2 text-gray-700">Uh-oh! Looks like the network cable is unplugged.</p>
                    </div>
                    <div className="mb-4">
                        {(errorData.type === 'ID_MISSING' || errorData.type === 'NOT_FOUND' || errorData.type === 'FETCH_ERROR') && (
                            <h4 onClick={() => navigateTo('/dashboard/')} className="hover:cursor-pointer hover:text-blue-400 border-b-2 border-spacing-2 flex flex-row items-center gap-2"> <ArrowLeft /> Go back to Dashboard</h4>
                        )}
                    </div>
                </section>
            </Alert.Content>
        </Alert>
    );
};

export default NotFound;