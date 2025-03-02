import type { AppUser } from "@prisma/client";
import type { RegisterUserRequestPayload } from "common";
import { IUserRepository, IUserService } from "../types/classInterfaces";
import { validateEmail, ValidationError } from "../utils/validation";

export class UserService implements IUserService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository
    }
    async updateUser(id: number, data: Partial<AppUser>): Promise<Partial<AppUser>> {
        // validate email if it exists
        if (data.email && !validateEmail(data.email)) {
            throw new ValidationError('Invalid email format');
        }

        // check if existing email if it exists
        if (data.email) {
            const existingUserWithEmail = await this.userRepository.findByEmail(data.email);
            if (existingUserWithEmail && existingUserWithEmail.id !== id) {
                throw new ValidationError('User with this email already exists');
            }
        }

        // check if existing username if it exists
        if (data.username) {
            const existingUserWithUsername = await this.userRepository.findByUsername(data.username);
            if (existingUserWithUsername && existingUserWithUsername.id !== id) {
                throw new ValidationError('User with this username already exists');
            }
        }

        // update user
        return this.userRepository.update(id, data);
    }

    async createUser(formData: RegisterUserRequestPayload): Promise<Partial<AppUser>> {
        // validate email if it exists
        if (formData.email && !validateEmail(formData.email)) {
            throw new ValidationError('Invalid email format');
        }

        // check if existing email if it exists
        if (formData.email) {
            const existingUserWithEmail = await this.userRepository.findByEmail(formData.email);
            if (existingUserWithEmail) {
                throw new ValidationError('User with this email already exists');
            }
        }

        // check if existing username if it exists
        if (formData.username) {
            const existingUserWithUsername = await this.userRepository.findByUsername(formData.username);
            if (existingUserWithUsername) {
                throw new ValidationError('User with this username already exists');
            }
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

    getAllUsers(): Promise<Partial<AppUser>[]> {
        return this.userRepository.getAll();
    }

    deleteUser(id: number): Promise<Partial<AppUser> | null> {
        return this.userRepository.delete(id);
    }

}