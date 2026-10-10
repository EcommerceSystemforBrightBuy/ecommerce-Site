const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const db = require('../config/db');

const mapRoleToSystemRole = (roleStr) => {
  if (!roleStr) return 'warehouse_staff';
  const str = String(roleStr).trim().toLowerCase();
  if (str === 'admin' || str.includes('director') || str.includes('admin') || str.includes('administrator')) {
    return 'admin';
  }
  if (str === 'inventory_manager' || str.includes('inventory')) {
    return 'inventory_manager';
  }
  if (str === 'courier_staff' || str.includes('logistics') || str.includes('courier') || str.includes('dispatch')) {
    return 'courier_staff';
  }
  if (str === 'sales_analyst' || str.includes('analyst') || str.includes('sales')) {
    return 'sales_analyst';
  }
  return 'warehouse_staff';
};

const getAllStaff = async (req, res) => {
  try {
    // Ensure staff_profile table exists to prevent table missing crashes
    await db.execute(`
      CREATE TABLE IF NOT EXISTS staff_profile (
          user_id VARCHAR(50) NOT NULL,
          job_title VARCHAR(100) NOT NULL,
          hub VARCHAR(150) NOT NULL DEFAULT 'BrightBuy Central Texas Hub (Austin)',
          status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
          avatar_url VARCHAR(500) DEFAULT NULL,
          CONSTRAINT pk_staff_profile PRIMARY KEY (user_id),
          CONSTRAINT fk_staff_profile_user FOREIGN KEY (user_id) REFERENCES \`user\` (user_id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE = InnoDB;
    `);

    const [rows] = await db.execute(`
      SELECT
        u.user_id AS id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        COALESCE(sp.job_title, 'Warehouse Staff') AS role,
        u.role AS system_role,
        u.email,
        u.phone,
        COALESCE(sp.status, 'active') AS status,
        COALESCE(sp.hub, 'BrightBuy Central Texas Hub (Austin)') AS hub,
        sp.avatar_url AS avatar
      FROM \`user\` u
      LEFT JOIN staff_profile sp ON sp.user_id = u.user_id
      WHERE u.role IN ('warehouse_staff', 'admin', 'inventory_manager', 'courier_staff', 'sales_analyst')
      ORDER BY u.last_name ASC, u.first_name ASC
    `);

    return res.status(200).json(rows);
  } catch (error) {
    console.error('[Staff Controller] Error:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

const createStaff = async (req, res) => {
  const { name, role, email, password, phone, hub, avatar_url } = req.body || {};

  if (!name || !role || !email || !password) {
    return res.status(400).json({ message: 'Name, role, email, and password are required.' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }

  const nameParts = String(name).trim().split(/\s+/);
  const firstName = nameParts.shift();
  const lastName = nameParts.join(' ') || '-';

  if (!firstName || !String(role).trim()) {
    return res.status(400).json({ message: 'A valid name and role are required.' });
  }

  let connection;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    const roleStr = String(role).trim();
    const systemRole = mapRoleToSystemRole(roleStr);

    connection = await db.getConnection();
    await connection.beginTransaction();
    await connection.execute(
      'INSERT INTO `user` (user_id, email, password_hash, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        email.trim().toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone || null,
        systemRole,
      ]
    );
    await connection.execute(
      'INSERT INTO staff_profile (user_id, job_title, hub, status, avatar_url) VALUES (?, ?, ?, ?, ?)',
      [userId, roleStr, hub || 'BrightBuy Central Texas Hub (Austin)', 'active', avatar_url || null]
    );
    await connection.commit();

    return res.status(201).json({
      message: 'Staff member created successfully.',
      id: userId,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('[Staff Controller] Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create staff member.' });
  } finally {
    if (connection) connection.release();
  }
};

const updateStaff = async (req, res) => {
  const { id } = req.params;
  const { name, role, email, password, phone, hub, status, avatar_url } = req.body || {};

  if (!id) {
    return res.status(400).json({ message: 'Invalid staff ID.' });
  }

  const userFields = [];
  const userValues = [];
  const profileFields = [];
  const profileValues = [];

  if (name !== undefined) {
    const nameParts = String(name).trim().split(/\s+/);
    const firstName = nameParts.shift();
    const lastName = nameParts.join(' ') || '-';
    if (!firstName) return res.status(400).json({ message: 'Name cannot be empty.' });
    userFields.push('first_name = ?', 'last_name = ?');
    userValues.push(firstName, lastName);
  }

  if (email !== undefined) {
    userFields.push('email = ?');
    userValues.push(email.trim().toLowerCase());
  }

  if (phone !== undefined) {
    userFields.push('phone = ?');
    userValues.push(phone || null);
  }

  if (password) {
    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    userFields.push('password_hash = ?');
    try {
      userValues.push(await bcrypt.hash(password, 10));
    } catch (error) {
      console.error('[Staff Controller] Error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  if (role !== undefined) {
    const roleStr = String(role).trim();
    profileFields.push('job_title = ?');
    profileValues.push(roleStr);

    const systemRole = mapRoleToSystemRole(roleStr);
    userFields.push('role = ?');
    userValues.push(systemRole);
  }

  if (hub !== undefined) {
    profileFields.push('hub = ?');
    profileValues.push(hub);
  }

  if (status !== undefined) {
    profileFields.push('status = ?');
    profileValues.push(status);
  }

  if (avatar_url !== undefined) {
    profileFields.push('avatar_url = ?');
    profileValues.push(avatar_url || null);
  }

  if (userFields.length === 0 && profileFields.length === 0) {
    return res.status(400).json({ message: 'No fields provided for update.' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [existingRows] = await connection.execute(
      "SELECT user_id FROM `user` WHERE user_id = ? AND role IN ('warehouse_staff', 'admin', 'inventory_manager', 'courier_staff', 'sales_analyst') FOR UPDATE",
      [id]
    );
    if (existingRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Staff member not found.' });
    }

    if (userFields.length) {
      await connection.execute(
        `UPDATE \`user\` SET ${userFields.join(', ')} WHERE user_id = ?`,
        [...userValues, id]
      );
    }
    if (profileFields.length) {
      await connection.execute(
        `UPDATE staff_profile SET ${profileFields.join(', ')} WHERE user_id = ?`,
        [...profileValues, id]
      );
    }

    const [rows] = await connection.execute(`
      SELECT
        u.user_id AS id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        sp.job_title AS role,
        u.role AS system_role,
        u.email,
        u.phone,
        sp.status,
        sp.hub,
        sp.avatar_url AS avatar
      FROM \`user\` u
      INNER JOIN staff_profile sp ON sp.user_id = u.user_id
      WHERE u.user_id = ?
    `, [id]);
    await connection.commit();

    return res.status(200).json({
      message: 'Staff member updated successfully.',
      staff: rows[0] || null,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('[Staff Controller] Error:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  } finally {
    if (connection) connection.release();
  }
};

const deleteStaff = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Invalid staff ID.' });
  }

  try {
    const [result] = await db.execute(
      "DELETE FROM `user` WHERE user_id = ? AND role IN ('warehouse_staff', 'admin', 'inventory_manager', 'courier_staff', 'sales_analyst')",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Staff member not found.' });
    }

    return res.status(200).json({ message: 'Staff member deleted successfully.' });
  } catch (error) {
    console.error('[Staff Controller] Error:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

module.exports = {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
};

