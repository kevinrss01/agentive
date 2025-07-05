import { supabase } from '@/config/supabase';
import { JWTAuthenticatedRequest } from '@/middlewares/auth.middleware';
import { Response } from 'express';
import { z } from 'zod';

const SettingsSchema = z.object({
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export class UserController {
  settingsSave = async (req: JWTAuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      const parseResult = SettingsSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.flatten() });
        return;
      }

      const { error } = await supabase
        .from('user')
        .update({
          city: parseResult.data.city,
          postal_code: parseResult.data.postalCode,
          country: parseResult.data.country,
        })
        .eq('uuid', req.user.uuid)
        .single();

      if (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      res.json({ message: 'Settings saved', data: parseResult.data });
    } catch (error) {
      console.error('Error saving settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
