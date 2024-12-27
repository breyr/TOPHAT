import type { RegisterUserRequestPayload } from "../../../common/shared-types";
import { IUserRepository, IUserService } from "../types/classInterfaces";
import type { User } from "../types/models";
import { validateEmail, ValidationError } from "../utils/validation";

export class UserService implements IUserService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository
    }

    async createUser(formData: RegisterUserRequestPayload): Promise<User> {
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

    getUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }

    getUserByUsername(username: string): Promise<User | null> {
        return this.userRepository.findByUsername(username);
    }

    deleteUser(id: number): Promise<User | null> {
        return this.userRepository.delete(id);
    }

}