import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { RegisterUserResponsePayload } from "../../../../common/shared-types";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterUser() {
    const { register } = useAuth();
    const [credentials, setCredentials] = useState({ email: "", username: "", password: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState({ viewPassword: false, viewConfirmPassword: false });
    const [serverMessage, setServerMessage] = useState('');

    // handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCredentials(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    // handle password visible toggles
    const handleVisibilityChange = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { name } = e.currentTarget;
        setShowPassword(prevState => ({
            ...prevState,
            [name]: !showPassword[name]
        }))
    }

    // handle form submission
    const handleFormSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await register(credentials.username, credentials.email, credentials.password, 'ADMIN', 'ACCEPTED');
            if (typeof response !== 'boolean') {
                setServerMessage((response as RegisterUserResponsePayload).message);
            } else {
                // clear error on success
                setServerMessage('');
            }
        } catch {
            // handle error if needed
            setServerMessage('An error occurred during registration.');
        }
    }

    return (
        <form onSubmit={handleFormSubmission} className="flex flex-col">
            <div>
                <label className="font-bold block" htmlFor="email">Email</label>
                <input className="r-input large w-full" name="email" type="text" value={credentials.email} onChange={handleChange} />
            </div>
            <div>
                <label className="font-bold block" htmlFor="username">Username</label>
                <input className="r-input large w-full" name="username" type="text" value={credentials.username} onChange={handleChange} />
            </div>
            <div className="relative">
                <label className="font-bold block" htmlFor="password">Password</label>
                <input className="r-input large w-full" name="password" type={showPassword.viewPassword ? 'text' : 'password'} value={credentials.password} onChange={handleChange} />
                <button
                    name="viewPassword"
                    type="button"
                    className="absolute right-2 mt-1.5 text-grey-500"
                    onClick={handleVisibilityChange}
                    tabIndex={-1} // don't allow to be tabbed to
                >
                    {showPassword.viewPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
            </div>
            <div className="relative">
                <label className="font-bold block" htmlFor="confirmPassword">Confirm Password</label>
                <input
                    className={`r-input large w-full ${credentials.password != credentials.confirmPassword && credentials.confirmPassword.length > 0 ? 'error' : ''}`}
                    name="confirmPassword" type={showPassword.viewConfirmPassword ? 'text' : 'password'} value={credentials.confirmPassword} onChange={handleChange} />
                <button
                    name="viewConfirmPassword"
                    type="button"
                    className="absolute right-2 mt-1.5 text-grey-500"
                    onClick={handleVisibilityChange}
                    tabIndex={-1} // don't allow to be tabbed to
                >
                    {showPassword.viewConfirmPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
                {
                    credentials.password != credentials.confirmPassword && credentials.confirmPassword.length > 0 && (
                        <p className="italic text-red-400">Passwords must match</p>
                    )
                }
            </div>
            {
                serverMessage && <p className="italic text-red-400">{serverMessage}.</p>
            }
            <button className="r-btn primary mt-5" type="submit">Submit</button>
        </form>
    )
}
