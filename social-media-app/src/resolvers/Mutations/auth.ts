import { IResolvers } from '@graphql-tools/utils';
import validator from 'validator';
import argon2 from 'argon2';
import JWT from 'jsonwebtoken';

import { config } from '../../config';
import { Context } from "../../index"
interface SignupArgs {
    credentials: {
        email: string;
        password: string;
    }
    name: string;
    bio?: string;
}
interface SignInArgs {
    credentials: {
        email: string;
        password: string;
    }
};
interface UserPayloadType {
    userErrors: {
        message: string;
    }[];
    token: string | null;
}
export const authResolvers: IResolvers = {
    signUp: async(_, args: SignupArgs, context: Context) : Promise<UserPayloadType> => {
        const { name, bio, } = args;
        const { email, password } = args.credentials;
        const { prisma } = context;
        if (!email || !password || !name) {
            return {
                userErrors: [
                    {
                        message: "Email, name and password are required",
                    }
                ],
                token: null
            }
        }
        const isEmail = validator.isEmail(email);
        if (!isEmail) {
            return {
                userErrors: [
                    {
                        message: "Email is invalid",
                    }
                ],
                token: null
            }
        }
        if(!name || !bio) {
            return {
                userErrors: [
                    {
                        message: "Name and bio are required",
                    }
                ],
                token: null
            }
        }
        const isSafePassword = validator.isStrongPassword(password);
        if (!isSafePassword) {
            return {
                userErrors: [
                    {
                        message: "Password is invalid",
                    }
                ],
                token: null
            }
        }
        const existingEmail = await prisma.user.findUnique({
            where: {
                email,
            }
        });
        if (existingEmail) {
            return {
                userErrors: [
                    {
                        message: 'User with this email already exists',
                    }
                ],
                token: null,
            }
        }
        const hashedPassword = await argon2.hash(password);
        const newUser = await prisma.user.create({
            data: { email, name, password: hashedPassword },
        });
        await prisma.profile.create({
            data: {
                bio,
                userId: newUser.id
            }
        });
        const token = JWT.sign({
            userId: newUser.id,
            email: newUser.email
        },
        config.JWT.SECRET,
        {
            expiresIn: 36000,
        });
        return {
            userErrors: [],
            token,
        }
            
    },
    signIn: async (_, args: SignInArgs, context: Context): Promise<UserPayloadType> => {
        const { email, password } = args.credentials;
        const { prisma } = context;
        if( !email || !password ) {
            return {
                userErrors: [
                    {
                        message: "Invalid Email or Password",
                    }
                ],
                token: null
            }
        }
        const user = await prisma.user.findUnique({
            where: {
                email,
            }
        });
        if (!user) {
            return {
                userErrors: [
                    {
                        message: "Invalid credentials",
                    }
                ],
                token: null
            }
        }
        const isValidPassword = await argon2.verify(user.password, password);
        if (!isValidPassword) {
            return {
                userErrors: [
                    {
                        message: "Invalid credentials",
                    }
                ],
                token: null
            }
        }
        const token = JWT.sign({
            userId: user.id,
            email: user.email
        },
        config.JWT.SECRET,
        {
            expiresIn: 36000,
        });
        return {
            userErrors: [],
            token,
        }
    },
}