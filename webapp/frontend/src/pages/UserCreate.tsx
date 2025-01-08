import { ArrowLeft, ArrowRight, CircleMinus, Eye, EyeOff, LogOut, User, UserRoundPlus } from "lucide-react";
import React, { useState } from "react";
import DataTable from 'react-data-table-component';
import { useNavigate } from "react-router-dom";
import { RegisterUserResponsePayload } from "../../../common/shared-types";
import customStyles from "../components/table/dataTableStyles";
import { useAuth } from "../hooks/useAuth";
import type { AppUser } from "../lib/authenticatedApi";
import { generateTempPassword } from "../lib/helpers";
import { useOnboardingStore } from "../stores/onboarding";

export default function UserCreatePage() {
    const navigateTo = useNavigate();
    const { user, register, logout, authenticatedApiClient } = useAuth();
    const { model, step, setStep, adminCredentials, setAdminCredentials, additionalUsers, addAdditionalUser, updateAdditionalUser, removeAdditionalUser } = useOnboardingStore(
        (state) => state, // select the entire state object for this store, can specify by using dot notation
    );
    const [showUsersTable, setShowUsersTables] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [adminRegisterError, setAdminRegisterError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setAdminCredentials({ [name]: value })
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    }

    // registering the new admin account
    const handleFormSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await register(adminCredentials.username, adminCredentials.email, adminCredentials.password, 'ADMIN');
        if (typeof response !== 'boolean') {
            setAdminRegisterError((response as RegisterUserResponsePayload).message);
        } else {
            // clear error on success
            setAdminRegisterError('');
        }
    }

    // registering the users from the create additional users table
    // this will be called on the next step button if the users table is showing - make async with loading spinner
    const handleBulkUserCreation = async () => {
        const usersToRegister: AppUser[] = additionalUsers.map(user => ({
            username: user.email.split('@')[0],
            email: user.email,
            password: user.tempPassword,
            accountType: user.accountType,
        }));
        await authenticatedApiClient.registerUserBulk(usersToRegister);
    }

    // table handles
    const handleTableInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateAdditionalUser(index, { [name]: value });
    };

    const addNewRow = () => {
        addAdditionalUser({ email: '', username: '', tempPassword: generateTempPassword(), accountType: 'USER' });
    }

    const handleRowDeleteClick = (index: number) => {
        // delete a user
        removeAdditionalUser(index);
    }

    // move user to next step
    const navigateToNextStep = async () => {
        setIsLoading(true);
        try {
            if (showUsersTable && additionalUsers.length > 0) {
                await handleBulkUserCreation();
            }
            setStep(step + 1);
            navigateTo('/onboard/inventory');
        } catch (error) {
            console.error('Error during bulk user creation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        {
            name: 'Email',
            selector: row => row.email,
            cell: (row, index) => (
                <input
                    type="text"
                    value={row.email}
                    name="email"
                    placeholder="User's email"
                    onChange={(e) => handleTableInputChange(index, e)}
                    className="w-full focus:outline-none"
                />
            ),
        },
        {
            name: 'Temporary Password',
            selector: row => row.tempPassword,
            cell: (row, index) => (
                <input
                    type="text"
                    value={row.tempPassword}
                    name="tempPassword"
                    onChange={(e) => handleTableInputChange(index, e)}
                    className="w-full focus:outline-none"
                />
            ),
        },
        {
            name: 'Account Type',
            selector: row => row.accountType,
            cell: (row, index) => (
                <select
                    value={row.accountType}
                    name="accountType"
                    onChange={(e) => handleTableInputChange(index, e)}
                    className="w-full rounded bg-white"
                >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                </select>
            ),
        },
        {
            name: '',
            cell: (_row, index) => (
                <div className="flex flex-row justify-center">
                    <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleRowDeleteClick(index)}
                    >
                        <CircleMinus />
                    </button>
                </div>
            ),
            button: true,
            width: '56px',
        },
    ];

    return (
        <section className="flex flex-col h-full w-full p-8 items-center">
            <h1 className="text-4xl font-bold mb-4">User Creation</h1>
            {
                showUsersTable
                    ? <p className="text-lg mb-5 text-center">Add additional users, this can always be done later.</p>
                    : <p className="text-lg mb-5">Let&apos;s get your Admin account created.</p>
            }
            {
                !showUsersTable ? (
                    <section className="flex-1 w-full flex justify-center items-center">
                        {
                            user ? (
                                <section>
                                    <div className="w-full max-w-xl p-10 bg-white shadow-lg rounded-lg text-center">
                                        <div className="flex flex-row items-center justify-center gap-2 mb-4">
                                            <User size={32} className="text-blue-500" />
                                            <span className="text-2xl font-semibold">Hello, {user.username}.</span>
                                        </div>
                                        <p>Account creation successful, continue to the next step.</p>

                                        <div className="flex flex-col items-center mt-8 w-full">
                                            <div className="w-full">
                                                {
                                                    model == 'multi-tenant' && !showUsersTable && (
                                                        <button className="r-btn primary w-full flex flex-row items-center justify-center gap-1" onClick={() => setShowUsersTables(true)}>
                                                            Create more users <ArrowRight size={22} />
                                                        </button>
                                                    )
                                                }
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

                                <div className="flex-1 w-full flex justify-center items-center">
                                    <form onSubmit={handleFormSubmission} className="flex flex-col space-y-4 w-1/4">
                                        <div>
                                            <label className="font-bold mb-1 block" htmlFor="email">Email</label>
                                            <input className="r-input large w-full" name="email" type="text" value={adminCredentials.email} onChange={handleInputChange} />
                                        </div>
                                        <div>
                                            <label className="font-bold mb-1 block" htmlFor="username">Username</label>
                                            <input className="r-input large w-full" name="username" type="text" value={adminCredentials.username} onChange={handleInputChange} />
                                        </div>
                                        <div className="relative">
                                            <label className="font-bold mb-1 block" htmlFor="password">Password</label>
                                            <input className="r-input large w-full" name="password" type={showPassword ? 'text' : 'password'} value={adminCredentials.password} onChange={handleInputChange} />
                                            <button
                                                type="button"
                                                className="absolute right-2 mt-1.5 text-grey-500"
                                                onClick={togglePasswordVisibility}
                                                tabIndex={-1} // don't allow to be tabbed to
                                            >
                                                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <label className="font-bold mb-1 block" htmlFor="confirmPassword">Confirm Password</label>
                                            <input
                                                className={`r-input large w-full ${adminCredentials.password != adminCredentials.confirmPassword && adminCredentials.confirmPassword.length > 0 ? 'error' : ''}`}
                                                name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={adminCredentials.confirmPassword} onChange={handleInputChange} />
                                            <button
                                                type="button"
                                                className="absolute right-2 mt-1.5 text-grey-500"
                                                onClick={toggleConfirmPasswordVisibility}
                                                tabIndex={-1} // don't allow to be tabbed to
                                            >
                                                {showConfirmPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                                            </button>
                                            {
                                                adminCredentials.password != adminCredentials.confirmPassword && adminCredentials.confirmPassword.length > 0 && (
                                                    <p className="italic text-red-400">Passwords must match</p>
                                                )
                                            }
                                        </div>
                                        {
                                            adminRegisterError && <p className="italic text-red-400">{adminRegisterError}.</p>
                                        }
                                        <button className="r-btn primary" type="submit">Submit</button>
                                    </form>
                                </div>
                            )
                        }
                    </section>
                ) : (
                    <div className="flex-grow w-full flex flex-col h-full">
                        <div className="flex-1 overflow-auto">
                            <div className="flex flex-row justify-end mb-4">
                                <button
                                    className="r-btn tertiary flex flex-row items-center gap-2"
                                    onClick={addNewRow}>
                                    <UserRoundPlus /> Add User
                                </button>
                            </div>
                            <DataTable
                                columns={columns}
                                data={additionalUsers}
                                pagination
                                paginationRowsPerPageOptions={[5, 10, 15]}
                                customStyles={customStyles}
                            />
                        </div>
                        <div className="w-full flex justify-center">
                            <div className="flex flex-row items-center justify-center w-full max-w-md mt-4 gap-8">
                                <button
                                    className="r-btn primary w-full flex flex-row items-center justify-center gap-1"
                                    onClick={() => setShowUsersTables(false)}
                                >
                                    <ArrowLeft size={20} /> Admin login
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