import jwt, { type JwtPayload } from "jsonwebtoken";
import { config } from "../config/config.js";
import type { TokenPayload, TokenPayload } from "../types.js";

// Type fix for JWT expiresIn option when signing the payload
// type TokenExpiry = NonNullable<jwt.SignOptions["expiresIn"]>;
// const accessTokenExpiry = config.ACCESS_TOKEN_EXPIRY as TokenExpiry;
// const refreshTokenExpiry = config.REFRESH_TOKEN_EXPIRY as TokenExpiry;

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.ACCESS_TOKEN_EXPIRY,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.REFRESH_TOKEN_EXPIRY,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(
      token,
      config.JWT_REFRESH_SECRET,
    ) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const getPayload = (payload: TokenPayload): TokenPayload => {
  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
  };
};
