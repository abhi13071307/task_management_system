import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { JwtPayload } from '../types';

export const generateAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: config.accessTokenExpiry as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.accessTokenSecret, options);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: config.refreshTokenExpiry as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.refreshTokenSecret, options);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.accessTokenSecret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.refreshTokenSecret) as JwtPayload;
};
