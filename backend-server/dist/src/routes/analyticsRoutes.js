"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// GET analytics dashboard metrics (Admin only)
router.get('/', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const user = await models_1.User.findByPk(req.user.id);
        if (user?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const totalUsers = await models_1.User.count();
        const activeListings = await models_1.Listing.count({ where: { status: 'active' } });
        const totalListings = await models_1.Listing.count();
        const totalChats = await models_1.Chat.count();
        const pendingReports = await models_1.Report.count({ where: { status: 'pending' } });
        // Revenue or volume (mocked for now, but could sum listing prices if they were sold)
        const soldListings = await models_1.Listing.findAll({ where: { status: 'sold' } });
        let totalTransactionVolume = 0;
        soldListings.forEach(l => { totalTransactionVolume += (l.price || 0); });
        const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        // Group users by month and userType
        const allUsers = await models_1.User.findAll({ attributes: ['createdAt', 'userType'] });
        const monthlyRegsMap = new Map();
        // Initialize last 6 months
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mName = MONTH_NAMES[d.getMonth()];
            monthlyRegsMap.set(mName, { month: mName, jewellers: 0, centres: 0, refiners: 0 });
        }
        allUsers.forEach(u => {
            const uAny = u;
            if (!uAny.createdAt)
                return;
            const d = new Date(uAny.createdAt);
            const mName = MONTH_NAMES[d.getMonth()];
            if (monthlyRegsMap.has(mName)) {
                const entry = monthlyRegsMap.get(mName);
                if (u.userType === 'jeweller')
                    entry.jewellers++;
                else if (u.userType === 'hallmarking_centre')
                    entry.centres++;
                else if (u.userType === 'refiner')
                    entry.refiners++;
                // If userType is null, default to jeweller for testing/demo purposes since standard users exist
                else
                    entry.jewellers++;
            }
        });
        // Group listings by month and status
        const allListingsForMonthly = await models_1.Listing.findAll({ attributes: ['createdAt', 'status'] });
        const monthlyListingsMap = new Map();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mName = MONTH_NAMES[d.getMonth()];
            monthlyListingsMap.set(mName, { month: mName, created: 0, sold: 0 });
        }
        allListingsForMonthly.forEach(l => {
            const lAny = l;
            if (!lAny.createdAt)
                return;
            const d = new Date(lAny.createdAt);
            const mName = MONTH_NAMES[d.getMonth()];
            if (monthlyListingsMap.has(mName)) {
                const entry = monthlyListingsMap.get(mName);
                entry.created++;
                if (l.status === 'sold')
                    entry.sold++;
            }
        });
        // --- State Distribution ---
        const stateMap = new Map();
        allUsers.forEach(u => {
            const st = u.state || 'Unknown';
            if (!stateMap.has(st))
                stateMap.set(st, { state: st, users: 0, listings: 0 });
            stateMap.get(st).users++;
        });
        const activeListingsArr = await models_1.Listing.findAll({ where: { status: 'active' }, attributes: ['state'] });
        activeListingsArr.forEach(l => {
            const st = l.state || 'Unknown';
            if (!stateMap.has(st))
                stateMap.set(st, { state: st, users: 0, listings: 0 });
            stateMap.get(st).listings++;
        });
        const stateDistribution = Array.from(stateMap.values());
        // --- Category Distribution ---
        // Count active listings per category
        const catListings = await models_1.Listing.findAll({ where: { status: 'active' }, attributes: ['categoryId'] });
        const catCounts = {};
        catListings.forEach(l => {
            const cid = l.categoryId || 'unknown';
            catCounts[cid] = (catCounts[cid] || 0) + 1;
        });
        const categoryDocs = await models_1.Category.findAll();
        const categoryNameMap = new Map();
        categoryDocs.forEach(c => categoryNameMap.set(c.id, c.name));
        const colors = ['#D4AF37', '#1A1A1A', '#4B5563', '#9CA3AF', '#F59E0B', '#3B82F6', '#10B981'];
        let colorIdx = 0;
        const categoryDistribution = Object.entries(catCounts).map(([cid, count]) => {
            const catName = cid === 'unknown' ? 'Uncategorized' : (categoryNameMap.get(cid) || 'Unknown Category');
            const item = {
                name: catName,
                value: count,
                color: colors[colorIdx % colors.length]
            };
            colorIdx++;
            return item;
        });
        res.status(200).json({
            totalUsers,
            activeListings,
            totalListings,
            totalChats,
            pendingReports,
            totalTransactionVolume,
            monthlyRegs: Array.from(monthlyRegsMap.values()),
            monthlyListings: Array.from(monthlyListingsMap.values()),
            stateDistribution,
            categoryDistribution
        });
    }
    catch (error) {
        console.error('Fetch analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});
exports.default = router;
