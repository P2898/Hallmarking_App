import { Router } from 'express';
import { Report, Listing, User } from '../models';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET all reports (Admin only)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.query;
    
    // Check if user is admin
    const user = await User.findByPk(req.user!.id);
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const whereClause: any = {};
    if (status) whereClause.status = status;

    const reports = await Report.findAll({
      where: whereClause,
      include: [
        { model: Listing, as: 'listing' },
        { model: User, as: 'reporter', attributes: ['id', 'displayName', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// POST create report (requires authentication)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { listingId, reason } = req.body;
    const reporterId = req.user!.id;

    if (!listingId || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const report = await Report.create({
      listingId,
      reporterId,
      reason,
      status: 'pending'
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// PUT update report status
router.put('/:id/status', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id as string;

    const user = await User.findByPk(req.user!.id);
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const report = await Report.findByPk(id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    report.status = status;
    await report.save();

    res.status(200).json(report);
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// DELETE report
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id as string;
    
    const user = await User.findByPk(req.user!.id);
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const report = await Report.findByPk(id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    await report.destroy();

    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

export default router;
