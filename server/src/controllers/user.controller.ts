import type { RequestHandler } from "express";
import asyncHandler from "../utils/asyncHandler.util.js"
import { prisma } from "../db/index.js";
import ApiError from "../utils/ApiError.util.js";
import httpStatusCodes from "../utils/httpStatusCodes.util.js";
import { comparePassword, hashPassword } from "../utils/password.util.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.util.js";

export const registerUser: RequestHandler = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const isEmailExists = await prisma.user.findUnique({ where: { email } });

    if (isEmailExists) {
        throw new ApiError(httpStatusCodes.BAD_REQUEST, "User with this email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    })

    return res
        .status(httpStatusCodes.CREATED)
        .json({
            message: "User registered successfully",
            user: { id: newUser.id, email: newUser.email, name: newUser.name }
        });
});

export const loginUser: RequestHandler = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid email or password");
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid email or password");
    }

    const tokenPayload = { id: user.id, email: user.email, name: user.name };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
    });

    return res.status(httpStatusCodes.OK)
        .json({
            message: "User logged in successfully",
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, name: user.name }
        });
});

export const logoutUser: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    const result = await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null }
    });

    if (result) {
        return res.status(httpStatusCodes.OK).json({
            success: true,
            message: "User logged out successfully",
        });
    } else {
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to log out user",
        })
    }

});

export const getCurrentUser: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true }
    });

    if (!user) {
        throw new ApiError(httpStatusCodes.NOT_FOUND, "User not found");
    }

    return res.status(httpStatusCodes.OK).json({
        success: true,
        user
    });
});

export const deleteUserAccount: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    const deletedUser = await prisma.user.delete({ where: { id: userId } });

    if (!deletedUser) {
        throw new ApiError(httpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to delete user account");
    }

    return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "User account deleted successfully"
    });
});
