import { getPool, sql } from '../config/database.js';

export const getPendingAffiliates = async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .query(`
        SELECT id, full_name, email, mt5_rebate_account, contact_details, 
               ox_ib_link, affiliate_code, created_at
        FROM Affiliates 
        WHERE status = 'Pending'
        ORDER BY created_at DESC
      `);

    res.json({ affiliates: result.recordset });
  } catch (error) {
    console.error('Get pending affiliates error:', error);
    res.status(500).json({ message: 'Failed to fetch pending affiliates' });
  }
};

export const approveAffiliate = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    await pool.request()
      .input('id', sql.Int, id)
      .input('admin_id', sql.Int, req.user.id)
      .query(`
        UPDATE Affiliates 
        SET status = 'Approved', approved_at = GETDATE(), approved_by = @admin_id
        WHERE id = @id AND status = 'Pending'
      `);

    res.json({ message: 'Affiliate approved successfully' });
  } catch (error) {
    console.error('Approve affiliate error:', error);
    res.status(500).json({ message: 'Failed to approve affiliate' });
  }
};

export const rejectAffiliate = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    await pool.request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE Affiliates 
        SET status = 'Rejected'
        WHERE id = @id AND status = 'Pending'
      `);

    res.json({ message: 'Affiliate rejected successfully' });
  } catch (error) {
    console.error('Reject affiliate error:', error);
    res.status(500).json({ message: 'Failed to reject affiliate' });
  }
};

export const getAllAffiliates = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const pool = getPool();

    let query = `
      SELECT id, full_name, email, mt5_rebate_account, affiliate_code, 
             status, created_at, approved_at
      FROM Affiliates
    `;
    
    const params = [];
    if (status) {
      query += ' WHERE status = @status';
      params.push({ name: 'status', type: sql.NVarChar, value: status });
    }
    
    query += ` ORDER BY created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    
    const request = pool.request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit));
    
    params.forEach(param => {
      request.input(param.name, param.type, param.value);
    });

    const result = await request.query(query);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM Affiliates';
    if (status) {
      countQuery += ' WHERE status = @status';
    }
    
    const countRequest = pool.request();
    if (status) {
      countRequest.input('status', sql.NVarChar, status);
    }
    
    const countResult = await countRequest.query(countQuery);

    res.json({
      affiliates: result.recordset,
      total: countResult.recordset[0].total,
      page: parseInt(page),
      totalPages: Math.ceil(countResult.recordset[0].total / limit)
    });
  } catch (error) {
    console.error('Get all affiliates error:', error);
    res.status(500).json({ message: 'Failed to fetch affiliates' });
  }
};

export const getAllDownlines = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const pool = getPool();

    const result = await pool.request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit))
      .query(`
        SELECT d.id, d.full_name, d.email, d.status, d.created_at,
               a1.full_name as sub1_name, a1.affiliate_code as sub1_code,
               a2.full_name as sub2_name, a2.affiliate_code as sub2_code
        FROM Downlines d
        LEFT JOIN Affiliates a1 ON d.sub1_affiliate_id = a1.id
        LEFT JOIN Affiliates a2 ON d.sub2_affiliate_id = a2.id
        ORDER BY d.created_at DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    const countResult = await pool.request()
      .query('SELECT COUNT(*) as total FROM Downlines');

    res.json({
      downlines: result.recordset,
      total: countResult.recordset[0].total,
      page: parseInt(page),
      totalPages: Math.ceil(countResult.recordset[0].total / limit)
    });
  } catch (error) {
    console.error('Get all downlines error:', error);
    res.status(500).json({ message: 'Failed to fetch downlines' });
  }
};

export const addDownlineManually = async (req, res) => {
  try {
    const { full_name, email, sub1_affiliate_code, sub2_affiliate_code } = req.body;
    const pool = getPool();

    // Get Sub1 affiliate ID
    const sub1Result = await pool.request()
      .input('code', sql.NVarChar, sub1_affiliate_code)
      .query('SELECT id FROM Affiliates WHERE affiliate_code = @code AND status = \'Approved\'');

    if (sub1Result.recordset.length === 0) {
      return res.status(400).json({ message: 'Invalid Sub1 affiliate code' });
    }

    let sub2_id = null;
    if (sub2_affiliate_code) {
      const sub2Result = await pool.request()
        .input('code', sql.NVarChar, sub2_affiliate_code)
        .query('SELECT id FROM Affiliates WHERE affiliate_code = @code AND status = \'Approved\'');

      if (sub2Result.recordset.length === 0) {
        return res.status(400).json({ message: 'Invalid Sub2 affiliate code' });
      }
      sub2_id = sub2Result.recordset[0].id;
    }

    // Check for existing downline
    const existingCheck = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT COUNT(*) as count FROM Downlines WHERE email = @email');

    if (existingCheck.recordset[0].count > 0) {
      return res.status(400).json({ message: 'Email already registered as downline' });
    }

    // Insert downline
    await pool.request()
      .input('full_name', sql.NVarChar, full_name)
      .input('email', sql.NVarChar, email)
      .input('sub1_id', sql.Int, sub1Result.recordset[0].id)
      .input('sub2_id', sql.Int, sub2_id)
      .query(`
        INSERT INTO Downlines (full_name, email, sub1_affiliate_id, sub2_affiliate_id)
        VALUES (@full_name, @email, @sub1_id, @sub2_id)
      `);

    res.status(201).json({ message: 'Downline added successfully' });
  } catch (error) {
    console.error('Add downline manually error:', error);
    res.status(500).json({ message: 'Failed to add downline' });
  }
};

export const updateAffiliateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const pool = getPool();

    await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, status)
      .query('UPDATE Affiliates SET status = @status WHERE id = @id');

    res.json({ message: 'Affiliate status updated successfully' });
  } catch (error) {
    console.error('Update affiliate status error:', error);
    res.status(500).json({ message: 'Failed to update affiliate status' });
  }
};