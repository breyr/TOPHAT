// holds interfaces similar to C#
import { CreateUserDTO, UserResponse } from "./types";

export interface IUserRepository {
    create(formData: CreateUserDTO): Promise<UserResponse>;
    findByEmail(email: string): Promise<UserResponse | null>;
    findByUsername(username: string): Promise<UserResponse | null>;
    delete(id: number): Promise<UserResponse | null>;
}

export interface IUserService {
    createUser(formData: CreateUserDTO): Promise<UserResponse>;
    getUserByEmail(email: string): Promise<UserResponse | null>;
    getUserByUsername(username: string): Promise<UserResponse | null>;
    deleteUser(id: number): Promise<UserResponse | null>;
}