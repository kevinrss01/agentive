import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  loginGoogle = async (_req: Request, res: Response): Promise<void> => {
    const baseFrontendUrl = process.env.FRONTEND_BASE_URL;
    const redirectUrl = `${baseFrontendUrl}/api/auth/callback`;
    const result = await this.authService.initiateGoogleLogin(redirectUrl);

    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(200).json({ url: result.url });
  };

  callback = async (req: Request, res: Response): Promise<void> => {
    const { accessToken } = req.body as { accessToken: string };

    const result = await this.authService.handleCallback(accessToken);

    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(200).json({ user: result.user, accessToken: result.token });
  };

  getUser = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;
    const result = await this.authService.getUserById(userId);

    if (result.error) {
      res.status(404).json({ error: result.error });
      return;
    }

    res.status(200).json({ user: result.user });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const result = await this.authService.verifyToken(token);

    if (result.error) {
      res.status(401).json({ error: result.error });
      return;
    }

    res.status(200).json({ user: result.user });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const { accessToken } = req.body as { accessToken: string };
    const result = await this.authService.logout(accessToken);

    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(200).json({ success: true });
  };
}
