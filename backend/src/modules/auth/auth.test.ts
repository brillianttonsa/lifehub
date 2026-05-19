import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { setAuthCookies, clearAuthCookies } from '../../utils/cookies';

vi.mock('./auth.service'); // 
vi.mock('../../utils/cookies'); // 

describe('AuthController', () => {
  let req: any;
  let res: any;
  let jsonMock: any; // 
  let statusMock: any;

  beforeEach(() => {
    jsonMock = vi.fn(); // 
    statusMock = vi.fn(() => ({ // 
      json: jsonMock,
    }));

    res = {
      status: statusMock,
      json: jsonMock,
    };

    req = {
      body: {},
      cookies: {},
    };

    vi.clearAllMocks(); // 
  });

  describe('signup', () => {
    it('should create a user', async () => {
      req.body = {
        email: 'test@example.com',
        password: '123456',
        fullName: 'Tonsa',
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
      };

      vi.mocked(AuthService.signup).mockResolvedValue(mockUser as any); // 

      await AuthController.signup(req, res);

      expect(AuthService.signup).toHaveBeenCalledWith(
        'test@example.com',
        '123456',
        'Tonsa',
      );

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        user: mockUser,
      });
    });
  });

  describe('login', () => {
    it('should login user and set cookies', async () => {
      req.body = {
        email: 'test@example.com',
        password: '123456',
      };

      const mockResponse = {
        user: { id: '1', email: 'test@example.com' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      vi.mocked(AuthService.login).mockResolvedValue(mockResponse as any);

      await AuthController.login(req, res);

      expect(AuthService.login).toHaveBeenCalledWith(
        'test@example.com',
        '123456',
      );

      expect(setAuthCookies).toHaveBeenCalledWith(
        res,
        'access-token',
        'refresh-token',
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        user: mockResponse.user,
      });
    });
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      req.cookies.refresh_token = 'old-token';

      vi.mocked(AuthService.refresh).mockResolvedValue({
        newAccess: 'new-access',
        newRefresh: 'new-refresh',
      } as any);

      await AuthController.refresh(req, res);

      expect(AuthService.refresh).toHaveBeenCalledWith('old-token');

      expect(setAuthCookies).toHaveBeenCalledWith(
        res,
        'new-access',
        'new-refresh',
      );

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
      });
    });

    it('should return 401 if no refresh token', async () => {
      await AuthController.refresh(req, res);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'No token',
      });
    });
  });

  describe('logout', () => {
    it('should clear cookies and logout', async () => {
      await AuthController.logout(req, res);

      expect(clearAuthCookies).toHaveBeenCalledWith(res);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Logged out',
      });
    });
  });

  describe('forgotPassword', () => {
    it('should call forgot password service', async () => {
      req.body = {
        email: 'test@example.com',
      };

      vi.mocked(AuthService.forgotPassword).mockResolvedValue(undefined as any);

      await AuthController.forgotPassword(req, res);

      expect(AuthService.forgotPassword).toHaveBeenCalledWith(
        'test@example.com',
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message:
          'If an account with that email exists, a reset link has been sent',
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      req.body = {
        token: 'reset-token',
        newPassword: 'new-password',
      };

      vi.mocked(AuthService.resetPassword).mockResolvedValue(undefined as any);

      await AuthController.resetPassword(req, res);

      expect(AuthService.resetPassword).toHaveBeenCalledWith(
        'reset-token',
        'new-password',
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Password updated successfully',
      });
    });
  });
});