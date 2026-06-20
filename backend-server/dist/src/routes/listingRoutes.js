"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// GET all listings (with seller and category details)
router.get('/', async (req, res) => {
    try {
        const { categoryId, sellerId, buyerId, status } = req.query;
        // Build filter dynamically
        const whereClause = {};
        if (categoryId)
            whereClause.categoryId = categoryId;
        if (sellerId)
            whereClause.sellerId = sellerId;
        if (buyerId)
            whereClause.buyerId = buyerId;
        if (status && status !== 'all') {
            whereClause.status = status;
        }
        else if (!status) {
            whereClause.status = 'active'; // Default to active listings
        }
        const listings = await models_1.Listing.findAll({
            where: whereClause,
            include: [
                { model: models_1.User, as: 'seller', attributes: ['id', 'displayName', 'photoURL', 'phoneNumber'] },
                { model: models_1.Category, as: 'category' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(listings);
    }
    catch (error) {
        console.error('Fetch listings error:', error);
        res.status(500).json({ error: 'Failed to fetch listings' });
    }
});
// GET single listing
router.get('/:id', async (req, res) => {
    try {
        const listing = await models_1.Listing.findByPk(req.params.id, {
            include: [
                { model: models_1.User, as: 'seller', attributes: ['id', 'displayName', 'photoURL', 'phoneNumber', 'email'] },
                { model: models_1.Category, as: 'category' }
            ]
        });
        if (!listing)
            return res.status(404).json({ error: 'Listing not found' });
        res.status(200).json(listing);
    }
    catch (error) {
        console.error('Fetch listing error:', error);
        res.status(500).json({ error: 'Failed to fetch listing' });
    }
});
// POST create listing (requires authentication)
router.post('/', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { title, description, price, images, condition, location, categoryId, brand, model, yearOfPurchase, yearsUsed, warranty, pricingType, city, state, country } = req.body;
        const sellerId = req.user.id;
        if (!title || !price || !categoryId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const listing = await models_1.Listing.create({
            title,
            description: description || '',
            price,
            images: images || [],
            condition,
            location,
            sellerId,
            categoryId,
            brand,
            model,
            yearOfPurchase,
            yearsUsed,
            warranty,
            pricingType,
            city,
            state,
            country,
            status: 'active'
        });
        res.status(201).json(listing);
    }
    catch (error) {
        console.error('Create listing error:', error);
        res.status(500).json({ error: 'Failed to create listing' });
    }
});
// PUT update listing status
router.put('/:id/status', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { status, buyerId } = req.body;
        const id = req.params.id;
        const userId = req.user.id;
        const listing = await models_1.Listing.findByPk(id);
        if (!listing)
            return res.status(404).json({ error: 'Listing not found' });
        // Verify owner
        if (listing.sellerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to change this listing status' });
        }
        const updateData = { status };
        // Add buyerId if sold
        if (buyerId) {
            updateData.buyerId = buyerId;
        }
        await listing.update(updateData);
        res.status(200).json(listing);
    }
    catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Failed to update listing status' });
    }
});
// PUT update listing details
router.put('/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const { title, description, price, images, condition, location, categoryId, brand, model, yearOfPurchase, yearsUsed, warranty, pricingType, city, state, country } = req.body;
        const listing = await models_1.Listing.findByPk(id);
        if (!listing)
            return res.status(404).json({ error: 'Listing not found' });
        if (listing.sellerId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to update this listing' });
        }
        await listing.update({
            title,
            description,
            price,
            images,
            condition,
            location,
            categoryId,
            brand,
            model,
            yearOfPurchase,
            yearsUsed,
            warranty,
            pricingType,
            city,
            state,
            country
        });
        res.status(200).json(listing);
    }
    catch (error) {
        console.error('Update listing error:', error);
        res.status(500).json({ error: 'Failed to update listing' });
    }
});
// DELETE listing
router.delete('/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const listing = await models_1.Listing.findByPk(id);
        if (!listing)
            return res.status(404).json({ error: 'Listing not found' });
        if (listing.sellerId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this listing' });
        }
        await listing.destroy();
        res.status(200).json({ message: 'Listing deleted successfully' });
    }
    catch (error) {
        console.error('Delete listing error:', error);
        res.status(500).json({ error: 'Failed to delete listing' });
    }
});
exports.default = router;
