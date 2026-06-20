import { Router } from 'express';
import { User } from '../models';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// PUT update my profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { displayName, companyName, city, state, password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (displayName) user.displayName = displayName;
    if (companyName) user.companyName = companyName;
    if (city) user.city = city;
    if (state) user.state = state;
    
    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET all users (Admin only)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await User.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// DELETE user (Admin only)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id as string;
    
    const adminUser = await User.findByPk(req.user!.id);
    if (adminUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const targetUser = await User.findByPk(id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    await targetUser.destroy();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// PUT update user (Admin only)
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;
    
    const adminUser = await User.findByPk(req.user!.id);
    if (adminUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const targetUser = await User.findByPk(id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    if (role) {
      targetUser.role = role;
    }
    
    await targetUser.save();

    res.status(200).json(targetUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
