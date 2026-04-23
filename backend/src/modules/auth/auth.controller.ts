import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { setAuthCookies, clearAuthCookies } from "../../utils/cookies";

export class AuthController {

  static async signup(req: Request, res: Response) {
    const { email, password, fullName } = req.body;

    const user = await AuthService.signup(email, password, fullName);

    res.json({ user });
  }

  // login
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } =
      await AuthService.login(email, password);

    setAuthCookies(res, accessToken, refreshToken);

    res.json({ user });
  }

  // refresh
  static async refresh(req: Request, res: Response) {
    const token = req.cookies.refresh_token;

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const { newAccess, newRefresh } = await AuthService.refresh(token);

    setAuthCookies(res, newAccess, newRefresh);

    res.json({ success: true });
  }

  // logout
  static async logout(req: Request, res: Response) {
    clearAuthCookies(res);
    res.json({ message: "Logged out" });
  }


  // forgot password
  static async forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  const token = await AuthService.forgotPassword(email);

  res.json({
    message: "Reset link generated",
    token, // will remove in production, send email instead
  });
}

  // resetPassword
  static async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;

    await AuthService.resetPassword(token, newPassword);

    res.json({ message: "Password updated" });
  }
}