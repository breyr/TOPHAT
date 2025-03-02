import { ArrowLeft, ArrowRight, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginOrRegister from "../components/auth/LoginOrRegister";
import UsersTable from "../components/table/UsersTable";
import { useAuth } from "../hooks/useAuth";
import { useOnboardingStore } from "../stores/onboarding";

export default function UserCreatePage() {
    const navigateTo = useNavigate();
    const { user, logout } = useAuth();
    const { step, setStep } = useOnboardingStore(
        (state) => state, // select the entire state object for this store, can specify by using dot notation
    );
    const [showUsersTable, setShowUsersTables] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // move user to next step
    const navigateToNextStep = async () => {
        setIsLoading(true);
        try {
            setStep(step + 1);
            navigateTo('/onboard/inventory');
        } catch (error) {
            console.error('Error during bulk user creation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="flex flex-col h-full w-full p-8 items-center">
            <h1 className="text-4xl font-bold mb-4">User Creation</h1>
            {
                showUsersTable
                    ? <p className="text-lg mb-5 text-center">Add additional users, this can always be done later.</p>
                    : <p className="text-lg mb-5">Let&apos;s get you an Owner account created.</p>
            }
            {
                // show the login or register part of this step if we aren't showing the additional users table
                !showUsersTable ? (
                    <section className="flex-1 w-full flex justify-center items-center">
                        {
                            // if there is a user signed in, show the next steps buttons
                            user ? (
                                <section>
                                    <div className="w-full max-w-xl p-10 bg-[#ffffff] shadow-lg rounded-lg text-center">
                                        <div className="flex flex-row items-center justify-center gap-2 mb-4">
                                            <User size={32} className="text-blue-500" />
                                            <span className="text-2xl font-semibold">Hello, {user.username}.</span>
                                        </div>
                                        <p>Account creation successful, continue to the next step.</p>

                                        <div className="flex flex-col items-center mt-8 w-full">
                                            <div className="w-full">
                                                <button className="r-btn primary w-full flex flex-row items-center justify-center gap-1" onClick={() => setShowUsersTables(true)}>
                                                    Create more users <ArrowRight size={22} />
                                                </button>
                                            </div>

                                            <div className="flex flex-row w-full items-center my-4">
                                                <hr className="flex-grow border-t-2 border-gray-300" />
                                                <span className="mx-4 text-lg font-semibold">or</span>
                                                <hr className="flex-grow border-t-2 border-gray-300" />
                                            </div>

                                            <button
                                                onClick={logout}
                                                className="r-btn secondary danger flex items-center justify-center gap-2 w-full"
                                            >
                                                Wrong account? Log out and create a new one <LogOut size={24} />
                                            </button>
                                        </div>
                                    </div>
                                </section>

                            ) : (
                                // a user isn't signed in, so the login/registration forms
                                <div className="flex-1 w-full flex justify-center items-center">
                                    <LoginOrRegister />
                                </div>
                            )
                        }
                    </section>
                ) : (
                    <div className="flex-grow w-full flex flex-col h-full">
                        <div className="flex-1 overflow-auto">
                            <UsersTable />
                        </div>
                        <div className="w-full flex justify-center">
                            <div className="flex flex-row items-center justify-center w-full max-w-md mt-4 gap-8">
                                <button
                                    className="r-btn primary w-full flex flex-row items-center justify-center gap-1"
                                    onClick={() => setShowUsersTables(false)}
                                >
                                    <ArrowLeft size={20} /> Admin Login
                                </button>
                                <button
                                    className="r-btn primary w-full flex flex-row items-center justify-center gap-1"
                                    onClick={navigateToNextStep}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : 'Continue'} <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                )
            }
        </section>
    );
}