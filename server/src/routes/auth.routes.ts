import { Router, Request, Response } from 'express';
import { auth } from '../config/auth';
import { toNodeHandler } from 'better-auth/node';

const router = Router();

// Better Auth handles all auth routes automatically
// This catches all /auth/* routes and passes them to Better Auth
// Using named wildcard for Express v5/path-to-regexp compatibility
router.all('/{*path}', (req: Request, res: Response) => {
    return toNodeHandler(auth)(req, res);
});

export default router;
