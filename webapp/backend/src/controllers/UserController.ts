import type { AppUser } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from "express";
import type { LoginRequestPayload, LoginResponsePayload, RegisterUserRequestPayload } from '../../../common/shared-types';
import { DIContainer } from "../config/DIContainer";
import { AuthenticatedRequest } from '../types/types';
import { createJwtToken } from '../utils/jwt';
import { validateEmail, ValidationError } from "../utils/validation";

export class UserController {
    private userService = DIContainer.getUserService();

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userRegisterPayload = { ...req.body } as RegisterUserRequestPayload
            const user = await this.userService.createUser(userRegisterPayload)
            res.status(201).json({
                message: 'User created successfully',
                data: { user }
            });
        } catch (error) {
            // pass error to errorHandler middleware
            next(error);
        }
    }

    async validateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userLoginPayload = { ...req.body } as LoginRequestPayload
            // check if we have an email or username
            let user: AppUser | null
            if (validateEmail(userLoginPayload.usernameOrEmail)) {
                user = await this.userService.getUserByEmail(userLoginPayload.usernameOrEmail);
            } else {
                user = await this.userService.getUserByUsername(userLoginPayload.usernameOrEmail);
            }
            // check for existence of user and correct credentials
            if (!user || !bcrypt.compareSync(userLoginPayload.password, user.password)) {
                throw new ValidationError('Invalid credentials')
            }
            // create token
            const token = createJwtToken(user.id, user.username, user.email, user.accountType)
            const responsePayload: LoginResponsePayload = {
                message: 'Login successful',
                data: { token }
            };
            res.status(200).json(responsePayload);
        } catch (error) {
            // pass error to errorHandler middleware
            next(error);
        }
    }

    async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.getAllUsers();
            res.status(200).json({ data: users });
        } catch (error) {
            // pass error to errorHandler middleware
            next(error);
        }
    }

    async getUserByEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const email = req.params.email;
            const user = await this.userService.getUserByEmail(email);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.status(200).json({ data: user.email }); // just return the email of the user if found
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const userId = parseInt(req.params.id);
        try {
            const user = await this.userService.deleteUser(userId);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ message: 'User deleted successfully', data: user?.id });
        } catch (error) {
            // pass error to errorHandler middleware
            next(error);
        }
    }

    async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = parseInt(req.params.id);
            const userData = { ...req.body } as Partial<AppUser>;
            const user = await this.userService.updateUser(userId, userData);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.status(200).json({
                message: 'User updated successfully',
                data: user.id,
            });
        } catch (error) {
            next(error);
        }
    }

}