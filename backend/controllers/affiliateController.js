import { getPool, sql } from '../config/database.js';
import { validationResult } from 'express-validator';

export const registerAffiliate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { full_name, email, mt5_rebate_account, contact_details, ox_ib_link } = req.body;
    const pool = getPool();

    // Check if email or MT5 account already exists
    const existingCheck = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('mt5_account', sql.NVarChar, mt5_rebate_account)
      .query(`
        SELECT COUNT(*) as count FROM Affiliates 
        WHERE email = @email OR mt5_rebate_account = @mt5_account
      `);

    if (existingCheck.recordset[0].count > 0) {
      return res.status(400).json({ 
        message: 'Email or MT5 rebate account already registered' 
      });
    }

    // Insert new affiliate
    const result = await pool.request()
      .input('full_name', sql.NVarChar, full_name)
      .input('email', sql.NVarChar, email)
      .input('mt5_rebate_account', sql.NVarChar, mt5_rebate_account)
      .input('contact_details', sql.NVarChar, contact_details || null)
      .input('ox_ib_link', sql.NVarChar, ox_ib_link || null)
      .query(`
        INSERT INTO Affiliates (full_name, email, mt5_rebate_account, contact_details, ox_ib_link)
        OUTPUT INSERTED.id, INSERTED.affiliate_code
        VALUES (@full_name, @email, @mt5_rebate_account, @contact_details, @ox_ib_link)
      `);

    // Generate affiliate code
    const affiliateId = result.recordset[0].id;
    const affiliateCode = `VTX${String(affiliateId).padStart(5, '0')}`;
    
    await pool.request()
      .input('id', sql.Int, affiliateId)
      .input('code', sql.NVarChar, affiliateCode)
      .query('UPDATE Affiliates SET affiliate_code = @code WHERE id = @id');

    res.status(201).json({
      message: 'Registration successful. Awaiting admin approval.',
      affiliate_code: affiliateCode
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const addDownline = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { full_name, email, affiliate_code } = req.body;
    const pool = getPool();

    // Get affiliate info
    const affiliateResult = await pool.request()
      .input('code', sql.NVarChar, affiliate_code)
      .query(`
        SELECT id, status FROM Affiliates 
        WHERE affiliate_code = @code AND status = 'Approved'
      `);

    if (affiliateResult.recordset.length === 0) {
      return res.status(400).json({ 
        message: 'Invalid affiliate code or affiliate not approved' 
      });
    }

    const affiliate = affiliateResult.recordset[0];

    // Check for existing downline with same email
    const existingDownline = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT COUNT(*) as count FROM Downlines WHERE email = @email');

    if (existingDownline.recordset[0].count > 0) {
      return res.status(400).json({ 
        message: 'Email already registered as downline' 
      });
    }

    // Get Sub2 (upline of current affiliate)
    const uplineResult = await pool.request()
      .input('affiliate_id', sql.Int, affiliate.id)
      .query(`
        SELECT sub1_affiliate_id as sub2_id FROM Downlines 
        WHERE id = (
          SELECT TOP 1 id FROM Downlines 
          WHERE sub1_affiliate_id = @affiliate_id OR sub2_affiliate_id = @affiliate_id
          ORDER BY created_at DESC
        )
      `);

    const sub2_id = uplineResult.recordset.length > 0 ? uplineResult.recordset[0].sub2_id : null;

    // Insert downline
    await pool.request()
      .input('full_name', sql.NVarChar, full_name)
      .input('email', sql.NVarChar, email)
      .input('sub1_id', sql.Int, affiliate.id)
      .input('sub2_id', sql.Int, sub2_id)
      .query(`
        INSERT INTO Downlines (full_name, email, sub1_affiliate_id, sub2_affiliate_id)
        VALUES (@full_name, @email, @sub1_id, @sub2_id)
      `);

    res.status(201).json({ message: 'Downline added successfully' });

  } catch (error) {
    console.error('Add downline error:', error);
    res.status(500).json({ message: 'Failed to add downline' });
  }
};

export const getAffiliateDownlines = async (req, res) => {
  try {
    const { affiliate_code } = req.params;
    const pool = getPool();

    // Get affiliate ID
    const affiliateResult = await pool.request()
      .input('code', sql.NVarChar, affiliate_code)
      .query('SELECT id FROM Affiliates WHERE affiliate_code = @code');

    if (affiliateResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }

    const affiliateId = affiliateResult.recordset[0].id;

    // Get downlines
    const downlines = await pool.request()
      .input('affiliate_id', sql.Int, affiliateId)
      .query(`
        SELECT id, full_name, email, status, created_at
        FROM Downlines 
        WHERE sub1_affiliate_id = @affiliate_id OR sub2_affiliate_id = @affiliate_id
        ORDER BY created_at DESC
      `);

    res.json({ downlines: downlines.recordset });

  } catch (error) {
    console.error('Get downlines error:', error);
    res.status(500).json({ message: 'Failed to fetch downlines' });
  }
};