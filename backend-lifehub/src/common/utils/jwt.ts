import { sign, verify, Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';

export const signAccessToken = (userId: string) => {
  return sign({ userId }, env.JWT_ACCESS_SECRET as Secret, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  });
};

export const signRefreshToken = (userId: string) => {
  return sign({ userId }, env.JWT_REFRESH_SECRET as Secret, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string, secret: string) => {
  return verify(token, secret as Secret) as { userId: string };
};