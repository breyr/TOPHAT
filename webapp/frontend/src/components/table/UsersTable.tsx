import { CircleMinus, Download, Loader2, UserRoundPlus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import type { PartialAppUser } from "../../../../common/shared-types";
import { useAuth } from "../../hooks/useAuth";
import { generateTempPassword } from "../../lib/helpers";
import { User } from "../../models/User";
import customStyles from "./dataTableStyles";

export default function UsersTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [errors, setErrors] = useState<{ [key: number]: string }>({});
    const { user, register, authenticatedApiClient } = useAuth();

    // Store pending updates in a ref to prevent unnecessary re-renders
    const pendingUpdates = useRef<{ [key: string]: NodeJS.Timeout }>({});

    // validate email format
    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    // check if email is unique
    const isEmailUnique = async (email: string) => {
        try {
            const res = await authenticatedApiClient.getUserByEmail(email);
            return !res.data;
        } catch (error) {
            if ((error as any).status === 404) {
                return true;
            }
            throw error;
        }
    };

    const updateUser = useCallback(async (index: number, name: string, value: string) => {
        const userToUpdate = users[index];

        if (name === 'email') {
            if (!validateEmail(value)) {
                setErrors(prev => ({ ...prev, [index]: 'Invalid email format' }));
                return;
            }

            try {
                if (!await isEmailUnique(value)) {
                    setErrors(prev => ({ ...prev, [index]: 'Email already exists' }));
                    return;
                }
            } catch (error) {
                console.error("Failed to check email uniqueness:", error);
                setErrors(prev => ({ ...prev, [index]: 'Failed to check email uniqueness' }));
                return;
            }
        }

        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
        });

        if (userToUpdate.accountStatus !== 'NOTCREATED') {
            await authenticatedApiClient.updateUser(userToUpdate.id, {
                [name]: value,
            });
        }
    }, [users, authenticatedApiClient]);

    const handleTableInputChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updateKey = `${index}-${name}`;

        // Clear any existing timeout for this field
        if (pendingUpdates.current[updateKey]) {
            clearTimeout(pendingUpdates.current[updateKey]);
        }

        // Update local state immediately
        setUsers(prevUsers => {
            const updatedUsers = [...prevUsers];
            const user = updatedUsers[index];
            if (user) {
                (user as any)[name] = value;
            }
            return updatedUsers;
        });

        // Set new timeout for this update
        pendingUpdates.current[updateKey] = setTimeout(() => {
            updateUser(index, name, value);
            delete pendingUpdates.current[updateKey];
        }, 1000);
    }, [updateUser]);

    const addNewRow = () => {
        const newUser = new User(
            Date.now(), // need an arbitrary id, this won't actually be used to create the user
            '',
            '',
            'USER',
            'NOTCREATED',
            generateTempPassword(),
            true
        );

        // update local state
        setUsers(prevUsers => [
            ...prevUsers,
            newUser
        ]);

        // register the new user in the database
        registerNewUser(newUser);
    };

    const handleRowDeleteClick = async (index: number) => {
        // if the deleted user is already created, we have to delete from the database
        if (users[index].accountStatus !== 'NOTCREATED') {
            await authenticatedApiClient.deleteUser(users[index].id);
        }
        setUsers(prevUsers => prevUsers.filter((_, i) => i !== index));
    };

    const registerNewUser = async (user: User) => {
        const response = await register(
            user.email.split('@')[0] ?? '',
            user.email ?? '',
            user.tempPassword!, // this exists when we add a new user to the table
            user.tempPassword!, // this exists when we add a new user to the table
            user.accountType,
            'PENDING',
            false // do not log in the user
        );

        // update the users state with the new IDs from the response - needed to do updates to the user in the db
        setUsers(prevUsers => {
            return prevUsers.map(u => {
                if (u.accountStatus === 'NOTCREATED') {
                    const updatedUser = response.data?.user;
                    if (updatedUser) {
                        return User.fromDatabase(updatedUser);
                    }
                }
                return u;
            });
        });
    };

    const handleDownloadUserInfo = () => {
        setIsDownloading(true);

        // create CSV content
        let csvContent = 'Email,Username,TempPassword\n';

        // filter and map the users to the CSV format
        users.filter(user => user.accountStatus === 'PENDING')
            .forEach(user => {
                csvContent += user.toCSV();
            });

        // create a Blob from the CSV content
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // create an invisible link element
        const link = document.createElement('a');
        if (link.download !== undefined) { // ensure the browser supports the 'download' attribute
            // create a URL for the Blob and set it as the href
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'pendingusers.csv'); // set the file name for download
            document.body.appendChild(link);
            link.click(); // trigger the download
            document.body.removeChild(link); // clean up after download

            // release the URL object to free memory
            URL.revokeObjectURL(url);
        }

        setIsDownloading(false);
    };

    const formatStatus = (status: string) => {
        return status === 'NOTCREATED' ? 'NOT CREATED' : status;
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await authenticatedApiClient.getAllUsers();
                const filteredUsers = res.data?.filter((appUser: PartialAppUser) => appUser.id !== user?.id);
                const usersWithFlag = filteredUsers?.map((appUser: PartialAppUser) => User.fromDatabase(appUser));
                setUsers(usersWithFlag || []);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };

        fetchUsers();

        // Cleanup function to clear any pending timeouts
        return () => {
            Object.values(pendingUpdates.current).forEach(timeout => clearTimeout(timeout));
        };
    }, [user, authenticatedApiClient]);

    const columns = [
        {
            name: 'Email',
            selector: row => row.email,
            cell: (row, index) => (
                <div className="w-full">
                    <input
                        type="text"
                        value={row.email}
                        name="email"
                        placeholder="User's email"
                        onChange={(e) => handleTableInputChange(index, e)}
                        className="w-full focus:outline-none"
                    />
                    {errors[index] && <span className="text-red-500">{errors[index]}</span>}
                </div>
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
            name: 'Account Status',
            selector: row => row.accountStatus,
            cell: (row) => (
                <span>{formatStatus(row.accountStatus)}</span>
            ),
        },
        {
            name: '',
            cell: (row, index) => (
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
        <>
            <div className="flex flex-row justify-end mb-4">
                <button
                    className="r-btn tertiary flex flex-row items-center gap-2"
                    onClick={addNewRow}
                >
                    <UserRoundPlus /> Add User
                </button>
                <button
                    className="r-btn tertiary flex flex-row items-center gap-2"
                    title="Click to download a CSV file of PENDING user information."
                    onClick={handleDownloadUserInfo}
                >
                    {isDownloading ?
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" /> :
                        <Download />
                    }
                    Download
                </button>
            </div>
            <DataTable
                columns={columns}
                data={users}
                customStyles={customStyles}
            />
        </>
    );
}