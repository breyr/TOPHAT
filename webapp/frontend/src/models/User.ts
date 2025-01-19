import { AccountStatus, AccountType } from "../../../common/shared-types";
import { PartialAppUser } from "../lib/authenticatedApi";

export class User {
    id: number;
    email: string;
    username: string;
    accountType: AccountType;
    accountStatus: AccountStatus;
    tempPassword?: string;
    isNewUser?: boolean;

    constructor(
        id: number,
        email: string,
        username: string,
        accountType: AccountType = 'USER',
        accountStatus: AccountStatus = 'NOTCREATED',
        tempPassword?: string,
        isNewUser: boolean = false,
    ) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.tempPassword = tempPassword;
        this.accountType = accountType;
        this.accountStatus = accountStatus;
        this.isNewUser = isNewUser;
    }

    /**
     * Converts the user data to a CSV-compatible string. This is used to download any new users that have been created 
     * or their status is pending. Accepted users' information will not be able to be downloaded.
     * 
     * @returns {string} A string containing the user's email, username, and temporary password
     */
    toCSV(): string {
        return `${this.email},${this.username},${this.tempPassword},\n`;
    }

    static fromDatabase(data: PartialAppUser): User {
        return new User(
            data.id,
            data.email || '',
            data.username || '',
            data.accountType,
            data.accountStatus,
            data.tempPassword,
            false
        )
    }
}