import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../../supabaseClient';
import { requireAuth } from '../security/authMiddleware';

const router = Router();

function splitEmailName(email: string): string {
  return email.split('@')[0];
}

// 1. POST /api/v1/auth/signup
router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Email and password are required'
        }
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || splitEmailName(email)
        }
      }
    });

    if (error) {
      return res.status(400).json({
        error: {
          code: 'SIGNUP_FAILED',
          message: error.message
        }
      });
    }

    res.status(201).json({
      message: 'Signup successful',
      data: {
        user: data.user,
        session: data.session
      }
    });
  } catch (err) {
    next(err);
  }
});

// 2. POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Email and password are required'
        }
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({
        error: {
          code: 'LOGIN_FAILED',
          message: error.message
        }
      });
    }

    res.json({
      message: 'Login successful',
      data: {
        user: data.user,
        session: data.session
      }
    });
  } catch (err) {
    next(err);
  }
});

// 3. GET /api/v1/auth/me
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      // Robust fall-back check: Try to create the profile row if it doesn't exist to bridge the gap
      const userEmail = (req as any).user.email;
      const fallbackName = splitEmailName(userEmail);

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          full_name: fallbackName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError || !newProfile) {
        return res.status(404).json({
          error: {
            code: 'PROFILE_NOT_FOUND',
            message: 'User profile was not initialized automatically and fallback creation failed: ' + (createError?.message || 'Unknown error')
          }
        });
      }

      return res.json({ data: newProfile });
    }

    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
});

// 4. PUT /api/v1/auth/profile
router.put('/profile', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { fullName, targetTitle, experienceLevel } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        onboarded_target_title: targetTitle,
        experience_level: experienceLevel,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        error: {
          code: 'PROFILE_UPDATE_FAILED',
          message: error.message
        }
      });
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
