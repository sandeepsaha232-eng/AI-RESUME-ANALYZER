import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../supabaseClient';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token is required. Please sign in.'
        }
      });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Your session has expired or is invalid. Please login again.'
        }
      });
    }

    // Attach verified user info to the request
    (req as any).user = {
      id: user.id,
      email: user.email || ''
    };

    next();
  } catch (err) {
    next(err);
  }
};
