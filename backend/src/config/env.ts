import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'access-secret',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
};
