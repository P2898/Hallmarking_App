"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// GET all reports (Admin only)
router.get('/', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { status } = req.query;
        // Check if user is admin
        const user = await models_1.User.findByPk(req.user.id);
        if (user?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const whereClause = {};
        if (status)
            whereClause.status = status;
        const reports = await models_1.Report.findAll({
            where: whereClause,
            include: [
                { model: models_1.Listing, as: 'listing' },
                { model: models_1.User, as: 'reporter', attributes: ['id', 'displayName', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(reports);
    }
    catch (error) {
        console.error('Fetch reports error:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});
// POST create report (requires authentication)
router.post('/', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { listingId, reason } = req.body;
        const reporterId = req.user.id;
        if (!listingId || !reason) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const report = await models_1.Report.create({
            listingId,
            reporterId,
            reason,
            status: 'pending'
        });
        res.status(201).json(report);
    }
    catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({ error: 'Failed to create report' });
    }
});
// PUT update report status
router.put('/:id/status', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        const id = req.params.id;
        const user = await models_1.User.findByPk(req.user.id);
        if (user?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const report = await models_1.Report.findByPk(id);
        if (!report)
            return res.status(404).json({ error: 'Report not found' });
        report.status = status;
        await report.save();
        res.status(200).json(report);
    }
    catch (error) {
        console.error('Update report error:', error);
        res.status(500).json({ error: 'Failed to update report' });
    }
});
// DELETE report
router.delete('/:id', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const user = await models_1.User.findByPk(req.user.id);
        if (user?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const report = await models_1.Report.findByPk(id);
        if (!report)
            return res.status(404).json({ error: 'Report not found' });
        await report.destroy();
        res.status(200).json({ message: 'Report deleted successfully' });
    }
    catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({ error: 'Failed to delete report' });
    }
});
exports.default = router;
