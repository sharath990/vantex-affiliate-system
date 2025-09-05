import express from 'express';
import { body } from 'express-validator';
import { 
  getPendingAffiliates, 
  approveAffiliate, 
  rejectAffiliate,
  getAllAffiliates,
  getAllDownlines,
  addDownlineManually,
  updateAffiliateStatus
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/affiliates/pending', getPendingAffiliates);
router.get('/affiliates', getAllAffiliates);
router.put('/affiliates/:id/approve', approveAffiliate);
router.put('/affiliates/:id/reject', rejectAffiliate);
router.put('/affiliates/:id/status', [
  body('status').isIn(['Pending', 'Approved', 'Rejected', 'Suspended', 'Banned']).withMessage('Invalid status')
], updateAffiliateStatus);

router.get('/downlines', getAllDownlines);
router.post('/downlines', [
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('sub1_affiliate_code').notEmpty().withMessage('Sub1 affiliate code is required')
], addDownlineManually);

export default router;