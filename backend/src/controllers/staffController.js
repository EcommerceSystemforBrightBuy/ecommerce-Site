const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const db = require('../config/db');

const getAllStaff = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        u.user_id AS id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        sp.job_title AS role,
        u.email,
        u.phone,
        sp.status,
        sp.hub,
        sp.avatar_url AS avatar
      FROM \`user\` u
      INNER JOIN staff_profile sp ON sp.user_id = u.user_id
      WHERE u.role = 'warehouse_staff'
      ORDER BY u.last_name ASC, u.first_name ASC
    `);

    return res.status(200).json(rows);
  } catch (error) {
    console.error('[Staff Controller] Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
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
    connection = await db.getConnection();
    await connection.beginTransaction();
    await connection.execute(
      'INSERT INTO `user` (user_id, email, password_hash, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        email,
        passwordHash,
        firstName,
        lastName,
        phone || null,
        'warehouse_staff',
      ]
    );
    await connection.execute(
      'INSERT INTO staff_profile (user_id, job_title, hub, status, avatar_url) VALUES (?, ?, ?, ?, ?)',
      [userId, String(role).trim(), hub || 'BrightBuy Central Texas Hub (Austin)', 'active', avatar_url || null]
    );
    await connection.commit();

    return res.status(201).json({
      message: 'Staff member created successfully.',
      id: userId,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('[Staff Controller] Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
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
    userValues.push(email);
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
    profileFields.push('job_title = ?');
    profileValues.push(String(role).trim());
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
      "SELECT user_id FROM `user` WHERE user_id = ? AND role = 'warehouse_staff' FOR UPDATE",
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
    return res.status(500).json({ message: 'Internal Server Error' });
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
      "DELETE FROM `user` WHERE user_id = ? AND role = 'warehouse_staff'",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Staff member not found.' });
    }

    return res.status(200).json({ message: 'Staff member deleted successfully.' });
  } catch (error) {
    console.error('[Staff Controller] Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
};
