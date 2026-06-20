"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// PUT update my profile
router.put('/profile', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { displayName, companyName, city, state, password } = req.body;
        const user = await models_1.User.findByPk(userId);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        if (displayName)
            user.displayName = displayName;
        if (companyName)
            user.companyName = companyName;
        if (city)
            user.city = city;
        if (state)
            user.state = state;
        if (password) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        await user.save();
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
// GET all users (Admin only)
router.get('/', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const user = await models_1.User.findByPk(req.user.id);
        if (user?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const users = await models_1.User.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Fetch users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
// DELETE user (Admin only)
router.delete('/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const adminUser = await models_1.User.findByPk(req.user.id);
        if (adminUser?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const targetUser = await models_1.User.findByPk(id);
        if (!targetUser)
            return res.status(404).json({ error: 'User not found' });
        await targetUser.destroy();
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});
// PUT update user (Admin only)
router.put('/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const { role } = req.body;
        const adminUser = await models_1.User.findByPk(req.user.id);
        if (adminUser?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const targetUser = await models_1.User.findByPk(id);
        if (!targetUser)
            return res.status(404).json({ error: 'User not found' });
        if (role) {
            targetUser.role = role;
        }
        await targetUser.save();
        res.status(200).json(targetUser);
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});
exports.default = router;
