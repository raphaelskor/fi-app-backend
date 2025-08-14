import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';

const router = Router();

// Validasi payload
const locationSchema = z.object({
  user_id: z.string().min(1, 'user_id wajib diisi'),
  latitude: z.number().refine(v => v >= -90 && v <= 90, 'latitude harus -90..90'),
  longitude: z.number().refine(v => v >= -180 && v <= 180, 'longitude harus -180..180'),
  // Optional. Jika tidak dikirim, kita biarkan DB default NOW()
  created_at: z.string().datetime().optional()
});

/**
 * POST /api/locations
 * Body JSON:
 * {
 *   "user_id": "abc123",
 *   "latitude": -6.2001,
 *   "longitude": 106.8167,
 *   "created_at": "2025-08-14T05:00:00.000Z"  // optional
 * }
 */
router.post('/', async (req, res) => {
  try {
    const parsed = locationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: parsed.error.flatten()
      });
    }

    const payload = parsed.data;

    // Siapkan row yang akan diinsert
    const row = {
      user_id: payload.user_id,
      latitude: payload.latitude,
      longitude: payload.longitude,
      // Hanya set created_at jika dikirim; jika tidak, biarkan default DB
      ...(payload.created_at ? { created_at: payload.created_at } : {})
    };

    const { data, error } = await supabase
      .from('fi_location')
      .insert(row)
      .select()
      .single();

    if (error) {
      // Jika error dari Supabase (misal constraint), lempar 500/409 sesuai kasus
      return res.status(500).json({ error: 'SUPABASE_ERROR', details: error.message });
    }

    return res.status(201).json({ message: 'Location stored', data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
