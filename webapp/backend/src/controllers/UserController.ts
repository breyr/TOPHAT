import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from "express";
import { DIContainer } from "../config/DIContainer";
import { CreateUserDTO, LoginRequestDTO, UserResponse } from "../types/types";
import { createJwtToken } from '../utils/jwt';
import { validateEmail, ValidationError } from "../utils/validation";

export class UserController {
    private userService = DIContainer.getUserService();

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userDTO = { ...req.body } as CreateUserDTO
            const user = await this.userService.createUser(userDTO)
            res.status(201).json({
                message: 'User created successfully',
                data: user
            });
        } catch (error) {
            // pass error to errorHandler middleware
            next(error);
        }
    }

    async validateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userDTO = { ...req.body } as LoginRequestDTO
            // check if we have an email or username
            let user: UserResponse | null
            if (validateEmail(userDTO.usernameOrEmail)) {
                user = await this.userService.getUserByEmail(userDTO.usernameOrEmail);
            } else {
                user = await this.userService.getUserByUsername(userDTO.usernameOrEmail);
            }
            // check for existence of user and correct credentials
            if (!user || !bcrypt.compareSync(userDTO.password, user.password)) {
                throw new ValidationError('Invalid credentials')
            }
            // create token
            const token = createJwtToken(user.id, user.username, user.email, user.account_type)
            res.status(200).json({
                message: 'Login successful',
                data: { token }
            })
        } catch (error) {
            // pass error to errorHandler middleware
            next(error);
        }
    }


}