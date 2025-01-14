import { User } from "lucide-react";
import { useState } from "react";
import LoginUser from "./LoginUser";
import RegisterUser from "./RegisterUser";

export default function LoginOrRegister() {
    const [showLoginForm, setShowLoginForm] = useState(true);

    return (
        <div className="p-10 bg-white shadow-lg rounded-lg w-1/5">
            {
                showLoginForm ?
                    <div>
                        <div className="flex justify-center mb-6">
                            <User className="text-blue-500 w-24 h-24" />
                        </div>
                        <LoginUser redirectToDashboard={false} />
                        <button className="r-btn tertiary mt-2 w-full" onClick={() => setShowLoginForm(!showLoginForm)}>Don't have an account? Register.</button>
                    </div>
                    :
                    <div>
                        <div className="flex justify-center mb-6">
                            <User className="text-blue-500 w-24 h-24" />
                        </div>
                        <RegisterUser />
                        <button className="r-btn tertiary mt-2 w-full" onClick={() => setShowLoginForm(!showLoginForm)}>Already have an account? Login.</button>
                    </div>
            }
        </div>
    )
}
