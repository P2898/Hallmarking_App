"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Helper: Auto-translate text using Google's free translation endpoint
async function translateText(text, targetLang) {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const resp = await fetch(url);
        const data = await resp.json();
        // Response format: [[["translated text","original text",...],...],...]
        return data?.[0]?.[0]?.[0] || text;
    }
    catch (err) {
        console.error(`Translation to ${targetLang} failed for "${text}":`, err);
        return text; // Fallback to original English name
    }
}
// GET all categories
router.get('/', async (req, res) => {
    try {
        const categories = await models_1.Category.findAll();
        // Auto-backfill translations for categories that don't have them
        for (const cat of categories) {
            if (!cat.nameHi || !cat.nameGu) {
                const [nameHi, nameGu] = await Promise.all([
                    cat.nameHi ? Promise.resolve(cat.nameHi) : translateText(cat.name, 'hi'),
                    cat.nameGu ? Promise.resolve(cat.nameGu) : translateText(cat.name, 'gu'),
                ]);
                cat.nameHi = nameHi;
                cat.nameGu = nameGu;
                await cat.save();
            }
        }
        res.status(200).json(categories);
    }
    catch (error) {
        console.error('Fetch categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});
// POST create a category (protected for admin only)
router.post('/', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const user = await models_1.User.findByPk(req.user.id);
        if (user?.role !== 'admin')
            return res.status(403).json({ error: 'Access denied' });
        const { name, icon } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        // Auto-translate to Hindi and Gujarati
        const [nameHi, nameGu] = await Promise.all([
            translateText(name, 'hi'),
            translateText(name, 'gu'),
        ]);
        const category = await models_1.Category.create({ name, icon, nameHi, nameGu });
        res.status(201).json(category);
    }
    catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});
// PUT update a category (protected for admin only)
router.put('/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const user = await models_1.User.findByPk(req.user.id);
        if (user?.role !== 'admin')
            return res.status(403).json({ error: 'Access denied' });
        const { name, icon } = req.body;
        const category = await models_1.Category.findByPk(req.params.id);
        if (!category)
            return res.status(404).json({ error: 'Category not found' });
        if (name && name !== category.name) {
            category.name = name;
            // Auto-translate the new name
            const [nameHi, nameGu] = await Promise.all([
                translateText(name, 'hi'),
                translateText(name, 'gu'),
            ]);
            category.nameHi = nameHi;
            category.nameGu = nameGu;
        }
        if (icon !== undefined)
            category.icon = icon;
        await category.save();
        res.status(200).json(category);
    }
    catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});
// DELETE a category (protected for admin only)
router.delete('/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const user = await models_1.User.findByPk(req.user.id);
        if (user?.role !== 'admin')
            return res.status(403).json({ error: 'Access denied' });
        const category = await models_1.Category.findByPk(req.params.id);
        if (!category)
            return res.status(404).json({ error: 'Category not found' });
        await category.destroy();
        res.status(200).json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});
exports.default = router;
