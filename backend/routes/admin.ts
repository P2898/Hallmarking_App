import { Router } from 'express';
import { pool } from '../server';

const router = Router();

// Middleware to verify Firebase Admin SDK token would go here
// router.use(verifyAdmin);

router.post('/approve-user/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    await pool.query('UPDATE users SET status = $1 WHERE firebase_uid = $2', ['approved', uid]);
    res.json({ message: 'User approved' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reject-user/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    await pool.query('UPDATE users SET status = $1 WHERE firebase_uid = $2', ['rejected', uid]);
    res.json({ message: 'User rejected' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/approve-listing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE listings SET status = $1 WHERE id = $2', ['active', id]);
    res.json({ message: 'Listing approved' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reject-listing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE listings SET status = $1 WHERE id = $2', ['rejected', id]);
    res.json({ message: 'Listing rejected' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/close-listing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE listings SET status = $1 WHERE id = $2', ['sold', id]);
    res.json({ message: 'Listing closed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/relist-listing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE listings SET status = $1 WHERE id = $2', ['active', id]);
    res.json({ message: 'Listing relisted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/listings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM listings');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/chats', async (req, res) => {
  // In a real scenario, chats might be in Firestore. 
  // If we also track them in PG, query here.
  res.json([]);
});

router.get('/analytics', async (req, res) => {
  res.json({ users: 0, listings: 0 });
});

router.post('/announcement', async (req, res) => {
  res.json({ message: 'Announcement sent' });
});

export default router;
