import { Router } from 'express';
import { pool } from '../server';

const router = Router();

// Middleware to verify Firebase Auth token would go here
// router.use(verifyUser);

router.get('/profile', async (req, res) => {
  try {
    // const uid = req.user.uid;
    const uid = 'placeholder';
    const result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    // const uid = req.user.uid;
    const uid = 'placeholder';
    const { full_name, company_name, city, state } = req.body;
    await pool.query(
      'UPDATE users SET full_name = $1, company_name = $2, city = $3, state = $4 WHERE firebase_uid = $5',
      [full_name, company_name, city, state, uid]
    );
    res.json({ message: 'Profile updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/account', async (req, res) => {
  try {
    // const uid = req.user.uid;
    const uid = 'placeholder';
    await pool.query('DELETE FROM users WHERE firebase_uid = $1', [uid]);
    res.json({ message: 'Account deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
