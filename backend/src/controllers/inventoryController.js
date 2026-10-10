const db = require('../config/db');

const getInventory = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        pv.sku,
        p.product_name,
        pv.variant_name,
        COALESCE(i.quantity_on_hand, 0) AS stock,
        pv.price
      FROM product_variant pv
      INNER JOIN product p ON p.product_id = pv.product_id
      LEFT JOIN inventory i ON pv.variant_id = i.variant_id
      WHERE pv.is_active = 1 AND p.is_active = 1
      ORDER BY p.product_name, pv.variant_name
    `);

    const inventory = rows.map((row) => ({
      ...row,
      stock: Number(row.stock),
      price: row.price !== null ? Number(row.price) : null,
    }));

    return res.status(200).json(inventory);
  } catch (error) {
    console.error('[Inventory Controller] Error fetching inventory:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

const adjustStock = async (req, res) => {
  const { sku } = req.params;
  const { adjustment, type } = req.body || {};
  const parsedAdjustment = Number(adjustment);
  const allowedTypes = ['restock', 'order_deduction', 'adjustment', 'return'];

  if (!sku || !Number.isInteger(parsedAdjustment) || parsedAdjustment === 0) {
    return res.status(400).json({ message: 'Invalid SKU or non-zero adjustment value required.' });
  }

  const normalizedType = type || 'adjustment';
  if (!allowedTypes.includes(normalizedType)) {
    return res.status(400).json({ message: 'Invalid inventory transaction type.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Fetch variant and associated inventory row
    const [variantRows] = await connection.execute(
      `SELECT pv.variant_id, i.inventory_id, i.quantity_on_hand
       FROM product_variant pv
       LEFT JOIN inventory i ON i.variant_id = pv.variant_id
       WHERE pv.sku = ?
       FOR UPDATE`,
      [sku]
    );

    if (variantRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: `SKU ${sku} not found.` });
    }

    const { variant_id, inventory_id, quantity_on_hand } = variantRows[0];
    const currentStock = quantity_on_hand !== null && quantity_on_hand !== undefined ? Number(quantity_on_hand) : 0;
    const newStock = currentStock + parsedAdjustment;

    if (newStock < 0) {
      await connection.rollback();
      return res.status(409).json({
        message: `Stock reduction failed: Current stock for SKU ${sku} is ${currentStock}. Cannot reduce by ${Math.abs(parsedAdjustment)}.`,
      });
    }

    let invId = inventory_id;

    if (invId) {
      // Update existing inventory record
      await connection.execute(
        `UPDATE inventory
         SET quantity_on_hand = ?, last_restocked_at = NOW()
         WHERE inventory_id = ?`,
        [newStock, invId]
      );
    } else {
      // Insert new inventory record if none existed
      invId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await connection.execute(
        `INSERT INTO inventory (inventory_id, variant_id, quantity_on_hand, last_restocked_at)
         VALUES (?, ?, ?, NOW())`,
        [invId, variant_id, newStock]
      );
    }

    // Insert transaction audit log
    const transId = `TR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await connection.execute(
      `INSERT INTO inventory_transaction
       (transaction_id, inventory_id, transaction_type, quantity_change, transaction_date)
       VALUES (?, ?, ?, ?, NOW())`,
      [transId, invId, normalizedType, parsedAdjustment]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Stock successfully updated for SKU ${sku}. New stock on hand: ${newStock}.`,
      sku,
      newStock,
    });
  } catch (error) {
    await connection.rollback();
    console.error('[Inventory Controller] Error adjusting stock:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getInventory,
  adjustStock,
};
