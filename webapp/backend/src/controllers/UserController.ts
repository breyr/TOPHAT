import type { AppUser } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from "express";
import type { LoginRequestPayload, LoginResponsePayload, RegisterUserRequestPayload } from '../../../common/shared-types';
import { DIContainer } from "../config/DIContainer";
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
                data: {
                    id: user.id
                }
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


}