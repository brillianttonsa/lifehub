import type { Response, CookieOptions } from 'express';
import { env } from '../../config/env';

const isProd = env.NODE_ENV === 'production';

// Base cookie configuration
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax', // 👈 CHANGED 'strict' TO 'none' FOR PRODUCTION!
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie('access_token', accessToken, cookieOptions);
  res.cookie('refresh_token', refreshToken, cookieOptions);
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie('access_token', cookieOptions);
  res.clearCookie('refresh_token', cookieOptions);
};