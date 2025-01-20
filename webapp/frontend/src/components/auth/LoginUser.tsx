import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function LoginUser({ redirectToDashboard }: { redirectToDashboard: boolean }) {
    const { login } = useAuth();
    const navigateTo = useNavigate();
    const [credentials, setCredentials] = useState({ usernameOrEmail: "", password: "" });
    const [serverMessage, setServerMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    // handle login
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { success, message } = await login(credentials.usernameOrEmail, credentials.password);
        if (success && redirectToDashboard) {
            navigateTo('/dashboard/')
        } else {
            // if not successful there will be a message returned from the backend that we can use
            setServerMessage(message ?? "A server error occurred");
        }
    }

    return (
        <form onSubmit={handleLogin} className="flex flex-col">
            <label className="font-bold" htmlFor="usernameOrEmail">Email or Username</label>
            <input className="r-input large" name="usernameOrEmail" type="text" value={credentials.usernameOrEmail} onChange={handleChange} />
            <div className="relative">
                <label className="font-bold block" htmlFor="password">Password</label>
                <input className="r-input large w-full" name="password" type={showPassword ? 'text' : 'password'} value={credentials.password} onChange={handleChange} />
                <button
                    name="viewPassword"
                    type="button"
                    className="absolute right-2 mt-1.5 text-grey-500"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1} // don't allow to be tabbed to
                >
                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
            </div>
            <button type="submit" className="r-btn primary mt-5">Log In</button>
            <span>{serverMessage}</span>
        </form>
    )
}
