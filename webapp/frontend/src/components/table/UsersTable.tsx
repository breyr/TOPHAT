import { CircleMinus, UserRoundPlus } from "lucide-react";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useAuth } from "../../hooks/useAuth";
import { PartialAppUser } from "../../lib/authenticatedApi";
import { generateTempPassword } from "../../lib/helpers";
import customStyles from "./dataTableStyles";

interface UserRowData extends PartialAppUser {
    tempPassword?: string;
    isNewUser?: boolean;
}

export default function UsersTable() {
    const [users, setUsers] = useState<UserRowData[]>([]);
    const { user, authenticatedApiClient } = useAuth();

    // on load get users from db
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await authenticatedApiClient.getAllUsers();
                // Assuming `user` is the current user object
                const filteredUsers = res.data?.filter((appUser: PartialAppUser) => appUser.id !== user?.id);
                const usersWithFlag = filteredUsers?.map((appUser: PartialAppUser) => ({ ...appUser, isNewUser: false }));
                setUsers(usersWithFlag || []);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };

        fetchUsers();
    }, [user, authenticatedApiClient]);

    // table handles
    const handleTableInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUsers(prevUsers => {
            const updatedUsers = [...prevUsers];
            updatedUsers[index] = { ...updatedUsers[index], [name]: value };
            return updatedUsers;
        });
    };

    const addNewRow = () => {
        setUsers(prevUsers => [
            ...prevUsers,
            { id: Date.now(), email: '', username: '', tempPassword: generateTempPassword(), accountType: 'USER', accountStatus: 'NOTCREATED', isNewUser: true }
        ]);
    }

    const handleRowDeleteClick = (index: number) => {
        setUsers(prevUsers => prevUsers.filter((_, i) => i !== index));
    }

    const formatStatus = (status: string) => {
        return status === 'NOTCREATED' ? 'NOT CREATED' : status;
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
                    onClick={addNewRow}>
                    <UserRoundPlus /> Add User
                </button>
            </div>
            <DataTable
                columns={columns}
                data={users}
                pagination
                paginationRowsPerPageOptions={[5, 10, 15]}
                customStyles={customStyles}
            />
        </>
    )
}