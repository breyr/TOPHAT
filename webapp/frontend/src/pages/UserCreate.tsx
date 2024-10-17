import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, CircleMinus, Eye, EyeOff, UserRoundPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableCell, TableInput, TableSelect } from "../components/Table";
import { generateTempPassword } from "../lib/helpers";
import { useOnboardingStore } from "../stores/onboarding";

export default function UserCreatePage() {
    const navigateTo = useNavigate();
    const { model, step, setStep, adminCredentials, setAdminCredentials, additionalUsers, addAdditionalUser, updateAdditionalUser, removeAdditionalUser } = useOnboardingStore(
        (state) => state, // select the entire state object for this store, can specify by using dot notation
    );
    const [showUsersTable, setShowUsersTables] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

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

    // table handles
    const handleTableInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateAdditionalUser(index, { [name]: value });
    };

    const addNewRow = () => {
        addAdditionalUser({ email: '', username: '', tempPassword: generateTempPassword(), accountType: 'User' });
    }

    const handleRowDeleteClick = (index: number) => {
        // delete a user
        removeAdditionalUser(index);
        // check if the current page has 0 items after deleting
        const newStartIndex = (currentPage - 1) * rowsPerPage;
        const newCurrentRows = additionalUsers.slice(newStartIndex, newStartIndex + rowsPerPage);
        if (newCurrentRows.length === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }

    // Pagination handlers
    const handleNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, Math.ceil(additionalUsers.length / rowsPerPage)));
    };

    const handlePreviousPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentRows = additionalUsers.slice(startIndex, startIndex + rowsPerPage);

    // move user to next step
    const navigateToNextStep = () => {
        // update data and step
        setStep(step + 1);
        navigateTo('/onboard/inventory');
    };

    return (
        <section className="flex flex-col h-full p-8 items-center">
            <h1 className="text-4xl font-bold mb-4">User Creation</h1>
            {
                showUsersTable
                    ? <p className="text-lg mb-5 text-center">Add additional users, this can always be done later.</p>
                    : <p className="text-lg mb-5">Let&apos;s get your Admin account created.</p>
            }
            {
                !showUsersTable ? (
                    <>
                        <div className="flex-1 w-full max-w-md">
                            <form className="flex flex-col space-y-4">
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
                                <button className="r-btn primary" type="submit">Submit</button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow w-full flex flex-col">
                        <div className="flex-1">
                            <div className="flex-1 overflow-auto">
                                <div className="flex flex-row justify-end">
                                    <button
                                        className="r-btn tertiary flex flex-row items-center gap-2"
                                        onClick={addNewRow}>
                                        <UserRoundPlus /> Add User
                                    </button>
                                </div>
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            {["Email", "Temporary Password", "Account Type", ""].map((header, i) => (
                                                <th key={i} className="w-1/3 text-left p-2 border-b">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentRows.map((row, index) => (
                                            <tr key={index}>
                                                <TableCell>
                                                    <TableInput
                                                        placeholder="User's email"
                                                        value={row.email}
                                                        name="email"
                                                        onChange={(e) => handleTableInputChange(index, e)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TableInput
                                                        placeholder="User's temporary password"
                                                        value={row.tempPassword}
                                                        name="tempPassword"
                                                        onChange={(e) => handleTableInputChange(index, e)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TableSelect
                                                        value={row.accountType}
                                                        name="accountType"
                                                        options={["User", "Admin"]}
                                                        onChange={(e) => handleTableInputChange(index, e)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <button
                                                        type="button"
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => handleRowDeleteClick(index)}
                                                    >
                                                        <CircleMinus />
                                                    </button>
                                                </TableCell>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <p>Page {currentPage} of {Math.ceil(additionalUsers.length / rowsPerPage) == 0 ? 1 : Math.ceil(additionalUsers.length / rowsPerPage)}</p>
                            <div>
                                <button
                                    type="button"
                                    onClick={handlePreviousPage}
                                    className="r-btn tertiary"
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextPage}
                                    className="r-btn tertiary"
                                    disabled={currentPage === Math.ceil(additionalUsers.length / rowsPerPage)}
                                >
                                    <ChevronRight />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            <div className="flex flex-row justify-center mt-8 w-full">
                {
                    model == 'multi-tenant' && !showUsersTable ? (
                        <button className="text-blue-500 hover:text-blue-600 font-semibold text-lg flex items-center" onClick={() => setShowUsersTables(true)}>
                            Create more users <ArrowRight size={22} />
                        </button>
                    ) : (
                        <div className={`flex flex-row ${showUsersTable ? "justify-between" : "justify-center"} w-full max-w-md`}>
                            {
                                showUsersTable && (
                                    <button className="text-blue-500 hover:text-blue-600 font-semibold text-lg flex items-center" onClick={() => setShowUsersTables(false)}>
                                        <ArrowLeft size={20} /> Admin login
                                    </button>
                                )
                            }
                            <button className="text-blue-500 hover:text-blue-600 font-semibold text-lg flex items-center" onClick={navigateToNextStep}>
                                Continue <ArrowRight size={20} />
                            </button>
                        </div>
                    )
                }
            </div>
        </section>
    );
}