import type { AppUser } from "@prisma/client";
import type { RegisterUserRequestPayload } from "../../../common/shared-types";
import { IUserRepository, IUserService } from "../types/classInterfaces";
import { validateEmail, ValidationError } from "../utils/validation";

export class UserService implements IUserService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository
    }

    async createUsers(formDataArray: RegisterUserRequestPayload[]): Promise<AppUser[]> {
        const createdUsers: AppUser[] = [];
        for (const formData of formDataArray) {
            // validate email
            if (!validateEmail(formData.email)) {
                throw new ValidationError(`Invalid email format for ${formData.email}`);
            }
            // check if existing email
            const existingUserWithEmail = await this.userRepository.findByEmail(formData.email);
            if (existingUserWithEmail) {
                throw new ValidationError(`User with email ${formData.email} already exists`);
            }
            // check if existing username
            const existingUserWithUsername = await this.userRepository.findByUsername(formData.username);
            if (existingUserWithUsername) {
                throw new ValidationError(`User with username ${formData.username} already exists`);
            }
            // create user
            const createdUser = await this.userRepository.create(formData);
            createdUsers.push(createdUser);
        }
        return createdUsers;
    }

    async createUser(formData: RegisterUserRequestPayload): Promise<AppUser> {
        // validate email
        if (!validateEmail(formData.email)) {
            throw new ValidationError('Invalid email format')
        }
        // check if existing email
        const existingUserWithEmail = await this.userRepository.findByEmail(formData.email);
        if (existingUserWithEmail) {
            throw new ValidationError('User with this email already exists')
        }
        // check if existing username
        const existingUserWithUsername = await this.userRepository.findByUsername(formData.username);
        if (existingUserWithUsername) {
            throw new ValidationError('User with this username already exists')
        }
        // create user
        return this.userRepository.create(formData);
    }

    async changePassword(id: number, newPassword: string): Promise<AppUser | null> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new ValidationError('User not found');
        }
        return this.userRepository.changePassword(id, newPassword);
    }

    getUserByEmail(email: string): Promise<AppUser | null> {
        return this.userRepository.findByEmail(email);
    }

    getUserByUsername(username: string): Promise<AppUser | null> {
        return this.userRepository.findByUsername(username);
    }

    getUserById(id: number): Promise<AppUser | null> {
        return this.userRepository.findById(id);
    }

    deleteUser(id: number): Promise<AppUser | null> {
        return this.userRepository.delete(id);
    }

}