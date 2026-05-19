import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { setAuthCookies, clearAuthCookies } from '../../utils/cookies';

export class AuthController {
  static async signup(req: Request, res: Response) {
    const { email, password, fullName } = req.body;

    const user = await AuthService.signup(email, password, fullName);

    res.status(201).json({ user });
  }

  // login
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await AuthService.login(
      email,
      password,
    );

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({ user });
  }

  // refresh
  static async refresh(req: Request, res: Response) {
    const token = req.cookies.refresh_token;

    if (!token) {
      return res.status(401).json({ message: 'No token' });
    }

    const { newAccess, newRefresh } = await AuthService.refresh(token);

    setAuthCookies(res, newAccess, newRefresh);

    res.json({ success: true });
  }

  // logout
  static async logout(req: Request, res: Response) {
    clearAuthCookies(res);
    res.json({ message: 'Logged out' });
  }

  // forgot password
  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    await AuthService.forgotPassword(email);

    res.status(200).json({
      message: 'If an account with that email exists, a reset link has been sent',
    });
  }

  // resetPassword
  static async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;

    await AuthService.resetPassword(token, newPassword);

    res.status(200).json({ message: 'Password updated successfully' });
  }

  // me - get current authenticated user
  static async me(req: Request, res: Response) {
    const userId = (req as any).userId;

    const user = await AuthService.getUserById(userId);

    res.status(200).json({ user });
  }
}
