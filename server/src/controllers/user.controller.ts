import type { RequestHandler } from "express";
import asyncHandler from "../utils/asyncHandler.util.js";
import { prisma } from "../db/index.js";
import ApiError from "../utils/ApiError.util.js";
import httpStatusCodes from "../utils/httpStatusCodes.util.js";
import { comparePassword, hashPassword } from "../utils/password.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getPayload,
  verifyRefreshToken,
} from "../utils/jwt.util.js";
import type { AuthenticatedRequest } from "../types.js";
import { CACHE_TTL, redis, redisKeys } from "../utils/redis.util.js";

export const registerUser: RequestHandler = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const isEmailExists = await prisma.user.findUnique({ where: { email } });

  if (isEmailExists) {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      "User with this email already exists",
    );
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return res.status(httpStatusCodes.CREATED).json({
    message: "User registered successfully",
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
  });
});

export const loginUser: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      "Invalid email or password",
    );
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      "Invalid email or password",
    );
  }

  const tokenPayload = { id: user.id, email: user.email, name: user.name };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return res.status(httpStatusCodes.OK).json({
    message: "User logged in successfully",
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

export const logoutUser: RequestHandler = asyncHandler(async (req, res) => {
  const { user } = req as AuthenticatedRequest;

  const result = await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: null },
  });

  if (!result) {
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to log out user",
    });
  }

  const key = redisKeys.user(user.id);
  await redis.del(key);

  return res.status(httpStatusCodes.OK).json({
    success: true,
    message: "User logged out successfully",
  });
});

export const getCurrentUser: RequestHandler = asyncHandler(async (req, res) => {
  const { user: authenticatedUser } = req as AuthenticatedRequest;

  const key = redisKeys.user(authenticatedUser.id);
  const cachedUser = await redis.get(key);

  if (cachedUser) {
    return res.status(httpStatusCodes.OK).json({
      success: true,
      user: JSON.parse(cachedUser),
      cached: true,
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: authenticatedUser.id },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    throw new ApiError(httpStatusCodes.NOT_FOUND, "User not found");
  }

  await redis.setex(key, CACHE_TTL.USER_DATA, JSON.stringify(user));

  return res.status(httpStatusCodes.OK).json({
    success: true,
    user,
  });
});

export const deleteUserAccount: RequestHandler = asyncHandler(
  async (req, res) => {
    const { user } = req as AuthenticatedRequest;

    const deletedUser = await prisma.user.delete({ where: { id: user.id } });

    if (!deletedUser) {
      throw new ApiError(
        httpStatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to delete user account",
      );
    }

    const key = redisKeys.user(user.id);
    await redis.del(key);

    return res.status(httpStatusCodes.OK).json({
      success: true,
      message: "User account deleted successfully",
    });
  },
);

export const getNewAccessToken: RequestHandler = asyncHandler(
  async (req, res) => {
    const refreshToken = req.body?.refreshToken as string;

    if (!refreshToken) {
      throw new ApiError(
        httpStatusCodes.UNAUTHORIZED,
        "Unauthorized, No refresh token provided",
      );
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new ApiError(
        httpStatusCodes.UNAUTHORIZED,
        "Invalid or expired refresh token",
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw new ApiError(
        httpStatusCodes.BAD_REQUEST,
        "Invalid or expired refresh token",
      );
    }

    if (user.refreshToken !== refreshToken) {
      throw new ApiError(
        httpStatusCodes.UNAUTHORIZED,
        "Invalid or expired refresh token",
      );
    }
    console.log("[Payload]: ", payload);

    const newAccessToken = generateAccessToken(getPayload(payload));
    const newRefreshToken = generateRefreshToken(getPayload(payload));

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return res.status(httpStatusCodes.OK).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  },
);
